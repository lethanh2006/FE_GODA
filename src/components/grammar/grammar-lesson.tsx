"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  ErrorNotice,
  PageLoading,
  ProgressBar,
} from "@/components/ui/feedback";
import { Furigana } from "@/components/vocab/furigana";
import { SpeakButton } from "@/components/vocab/speak-button";
import { japaneseSentenceText } from "@/lib/deck-games";
import type {
  GrammarFeedback,
  GrammarLesson as Lesson,
  GrammarQuestion,
} from "@/lib/grammar";
import { GrammarExercise } from "./grammar-exercise";
import { GrammarForms } from "./grammar-forms";

export function GrammarLesson({ chapter }: { chapter: number }) {
  const { data, error, mutate } = useSWR<Lesson>(`/grammar/n4/${chapter}`);
  if (error)
    return (
      <ErrorNotice
        message="Chưa tải được bài học."
        action={
          <Button variant="ghost" onClick={() => void mutate()}>
            Thử lại
          </Button>
        }
      />
    );
  if (!data) return <PageLoading label={`Đang chuẩn bị chương ${chapter}…`} />;
  return (
    <Study
      key={data.id}
      lesson={data}
      onProgress={(progress) => {
        void mutate(
          (current) => (current ? { ...current, progress } : current),
          { revalidate: false },
        );
      }}
    />
  );
}

function Study({
  lesson,
  onProgress,
}: {
  lesson: Lesson;
  onProgress: (progress: Lesson["progress"]) => void;
}) {
  const progress = lesson.progress;
  const [index, setIndex] = useState(() => {
    const done = new Set(
      lesson.progress.answers
        .filter((answer) => answer.correct)
        .map((answer) => answer.questionId),
    );
    const pending = lesson.patterns.findIndex((pattern) =>
      pattern.questions.some((question) => !done.has(question.id)),
    );
    return pending < 0 ? 0 : pending;
  });
  const [view, setView] = useState<"learn" | "practice" | "result" | "summary">(
    "learn",
  );
  const [queue, setQueue] = useState<GrammarQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [chapterRetry, setChapterRetry] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const pattern = lesson.patterns[index];
  const allQuestions = lesson.patterns.flatMap((item) => item.questions);
  const wrongIds = new Set(
    progress.answers
      .filter((answer) => !answer.correct)
      .map((answer) => answer.questionId),
  );
  const wrong = allQuestions.filter((question) => wrongIds.has(question.id));
  const pendingForPattern = pattern.questions.filter((question) =>
    wrongIds.has(question.id),
  );
  useEffect(() => {
    heading.current?.focus();
  }, [index, view]);
  function practice(questions: GrammarQuestion[], retry = false) {
    if (!questions.length) return;
    setQueue(questions);
    setQuestionIndex(0);
    setRound((current) => current + 1);
    setChapterRetry(retry);
    setView("practice");
  }
  function choose(next: number) {
    setIndex(next);
    setView("learn");
  }
  function checked(feedback: GrammarFeedback) {
    onProgress(feedback.progress);
  }
  const currentPattern =
    view === "practice"
      ? (lesson.patterns.find((item) =>
          item.questions.some(
            (question) => question.id === queue[questionIndex]?.id,
          ),
        ) ?? pattern)
      : pattern;
  return (
    <>
      <nav
        aria-label="Đường dẫn bài học"
        className="flex flex-wrap gap-2 text-sm text-muted"
      >
        <Link href="/ngu-phap-n4" className="hover:text-primary">
          Ngữ pháp N4
        </Link>
        <span aria-hidden>/</span>
        <span>Chương {lesson.chapter}</span>
      </nav>
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          {lesson.title}
        </h1>
        <div className="flex items-center gap-4">
          <ProgressBar
            value={(progress.correct / progress.total) * 100}
            className="flex-1"
          />
          <span className="shrink-0 text-sm text-muted tabular-nums">
            {progress.correct}/{progress.total} câu đã đúng
          </span>
        </div>
      </header>
      {wrong.length > 0 && (
        <div>
          <Button variant="secondary" onClick={() => practice(wrong, true)}>
            Luyện lại {wrong.length} câu sai
          </Button>
        </div>
      )}
      {view === "summary" ? (
        <section className="panel space-y-5 p-5 sm:p-7">
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-bold outline-none"
          >
            {progress.completed
              ? "Bạn đã luyện đúng cả chương."
              : "Mình đã đi hết các ý của chương này."}
          </h2>
          <p className="leading-relaxed">
            Đã làm đúng {progress.correct}/{progress.total} câu.
            {wrong.length > 0
              ? ` Còn ${wrong.length} câu cần luyện lại. Xem lại lời giải rồi thử một lần nữa nhé.`
              : " Bạn có thể quay lại bất kỳ mục nào để ôn."}
          </p>
          <div className="flex flex-wrap gap-3">
            {wrong.length > 0 && (
              <Button onClick={() => practice(wrong, true)}>
                Luyện lại {wrong.length} câu sai
              </Button>
            )}
            {lesson.chapter < 33 && (
              <ButtonLink
                href={`/ngu-phap-n4/${lesson.chapter + 1}`}
                variant={wrong.length ? "secondary" : "primary"}
              >
                Chương {lesson.chapter + 1}
              </ButtonLink>
            )}
            <ButtonLink href="/ngu-phap-n4" variant="secondary">
              Danh sách chương
            </ButtonLink>
          </div>
          {progress.answered < progress.total && (
            <p className="text-sm text-muted">
              Còn câu chưa làm. Chọn mục bên dưới để tiếp tục.
            </p>
          )}
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>
              Mục {lesson.patterns.indexOf(currentPattern) + 1}/
              {lesson.patterns.length}
            </p>
            {view === "practice" && (
              <Button
                variant="ghost"
                onClick={() => {
                  setIndex(lesson.patterns.indexOf(currentPattern));
                  setView("learn");
                }}
              >
                Xem lại cách dùng
              </Button>
            )}
          </div>
          <article className="panel space-y-6 p-5 sm:p-7">
            <h2
              ref={heading}
              tabIndex={-1}
              className="text-2xl leading-relaxed font-bold text-balance outline-none"
            >
              {currentPattern.title}
            </h2>
            {view === "learn" ? (
              <>
                <p className="text-lg leading-relaxed">{pattern.usage}</p>
                <section className="space-y-2 border-l-4 border-primary bg-subtle px-4 py-3">
                  <h3 className="font-semibold">Ghép thế nào?</h3>
                  <p className="leading-loose">
                    <Furigana text={pattern.formula} />
                  </p>
                </section>
                <GrammarForms />
                <section className="space-y-3">
                  <h3 className="font-semibold">Nhìn trong câu</h3>
                  <ul className="space-y-4">
                    {pattern.examples.map((example, item) => (
                      <li
                        key={item}
                        className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className="jp min-w-0 text-2xl leading-loose wrap-anywhere"
                            lang="ja"
                          >
                            <Furigana text={example.ja} />
                          </p>
                          <SpeakButton
                            text={japaneseSentenceText(example.ja)}
                            label={`Nghe ví dụ ${item + 1}`}
                          />
                        </div>
                        <p className="leading-relaxed text-muted">
                          {example.vi}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="space-y-2 rounded-xl bg-warning-soft p-4">
                  <h3 className="font-semibold">Chỗ dễ nhầm</h3>
                  <p className="leading-relaxed">
                    <Furigana text={pattern.pitfall} />
                  </p>
                </section>
                <Button size="lg" onClick={() => practice(pattern.questions)}>
                  Thử ngay · {pattern.questions.length} câu
                </Button>
              </>
            ) : view === "practice" ? (
              <GrammarExercise
                key={`${round}-${queue[questionIndex].id}`}
                question={queue[questionIndex]}
                chapter={lesson.chapter}
                number={questionIndex + 1}
                total={queue.length}
                onChecked={checked}
                onNext={() => {
                  if (questionIndex + 1 < queue.length)
                    setQuestionIndex((current) => current + 1);
                  else setView(chapterRetry ? "summary" : "result");
                }}
              />
            ) : (
              <section className="space-y-4">
                <p className="text-lg leading-relaxed">
                  {pendingForPattern.length
                    ? `Còn ${pendingForPattern.length} câu cần luyện lại ở mục này. Bạn có thể đọc lại cách dùng trước khi thử lại.`
                    : "Bạn đã luyện đúng các câu của mục này."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {pendingForPattern.length > 0 && (
                    <Button onClick={() => practice(pendingForPattern)}>
                      Luyện lại câu sai
                    </Button>
                  )}
                  <Button
                    variant={pendingForPattern.length ? "secondary" : "primary"}
                    onClick={() =>
                      index + 1 < lesson.patterns.length
                        ? choose(index + 1)
                        : setView("summary")
                    }
                  >
                    {index + 1 < lesson.patterns.length
                      ? "Học mục tiếp theo"
                      : "Xem cả chương"}
                  </Button>
                  <Button variant="ghost" onClick={() => setView("learn")}>
                    Đọc lại
                  </Button>
                </div>
              </section>
            )}
          </article>
        </>
      )}
      <details className="panel p-4 sm:p-5">
        <summary className="cursor-pointer rounded font-semibold focus-visible:outline-2 focus-visible:outline-primary">
          Chọn mục trong chương {lesson.chapter}
        </summary>
        <ol className="mt-3 space-y-2">
          {lesson.patterns.map((item, number) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => choose(number)}
                className="w-full rounded-lg px-3 py-3 text-left leading-relaxed hover:bg-subtle focus-visible:outline-2 focus-visible:outline-primary"
                aria-current={
                  view !== "summary" &&
                  lesson.patterns.indexOf(currentPattern) === number
                    ? "step"
                    : undefined
                }
              >
                {number + 1}. {item.title}
              </button>
            </li>
          ))}
        </ol>
      </details>
      <details className="text-sm leading-relaxed text-muted">
        <summary className="cursor-pointer rounded py-2 focus-visible:outline-2 focus-visible:outline-primary">
          Đối chiếu bài gốc trong khóa N4
        </summary>
        <p className="mt-2">
          Phần giải thích và bài tập này do Goda biên soạn để học bổ trợ. Bạn có
          thể xem lại bài trong tài khoản Dũng Mori của mình:
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {lesson.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-primary"
              >
                {source.title}
                <span className="sr-only"> (mở tab mới)</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
