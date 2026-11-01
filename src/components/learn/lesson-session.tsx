"use client";

import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorNotice, PageLoading } from "@/components/ui/feedback";
import { speakJapanese } from "@/components/vocab/speak-button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { JlptLevel } from "@/lib/types";
import { type LessonDetail, meaningLine, rememberPendingWords, type WordCard } from "@/lib/vocab";
import { Flashcard } from "./flashcard";
import { FocusBar } from "./focus-bar";

type Step = "learn" | "quiz" | "done";

interface Question {
  word: WordCard;
  /** "meaning": nhìn từ chọn nghĩa; "word": nhìn nghĩa chọn từ. */
  kind: "meaning" | "word";
  options: WordCard[];
}

const shuffled = <T,>(items: readonly T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/** Mỗi từ một câu; phương án nhiễu lấy từ các từ khác trong bài và không trùng nghĩa. */
function buildQuestions(words: WordCard[]): Question[] {
  return shuffled(words).map((word) => {
    const others = shuffled(words.filter((w) => w.id !== word.id && meaningLine(w) !== meaningLine(word)));
    return {
      word,
      kind: Math.random() < 0.5 ? "meaning" : "word",
      options: shuffled([word, ...others.slice(0, 3)]),
    };
  });
}

export function LessonSession({ level, no }: { level: JlptLevel; no: number }) {
  const { data, error, isLoading, mutate } = useSWR<LessonDetail>(`/vocab/levels/${level}/lessons/${no}`, {
    revalidateIfStale: false,
  });
  const exitHref = `/hoc-tu/${level.toLowerCase()}`;

  if (isLoading) return <PageLoading label="Đang chuẩn bị bài học…" />;
  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorNotice
          message="Không tải được bài học. Vui lòng thử lại."
          action={<button type="button" className="font-semibold underline" onClick={() => void mutate()}>Thử lại</button>}
        />
      </div>
    );
  }
  return <LessonFlow key={`${level}-${no}`} lesson={data} exitHref={exitHref} />;
}

function LessonFlow({ lesson, exitHref }: { lesson: LessonDetail; exitHref: string }) {
  const [step, setStep] = useState<Step>("learn");
  const [questions, setQuestions] = useState<Question[]>([]);
  const title = `${lesson.level} · Bài ${lesson.no}`;

  if (step === "learn") {
    return (
      <LearnStep
        lesson={lesson}
        exitHref={exitHref}
        title={title}
        onFinish={() => {
          setQuestions(buildQuestions(lesson.words));
          setStep("quiz");
        }}
      />
    );
  }
  if (step === "quiz") {
    return <QuizStep questions={questions} exitHref={exitHref} title={title} onFinish={() => setStep("done")} />;
  }
  return <DoneStep lesson={lesson} exitHref={exitHref} />;
}

function LearnStep({
  lesson,
  exitHref,
  title,
  onFinish,
}: {
  lesson: LessonDetail;
  exitHref: string;
  title: string;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = lesson.words[index];
  const isLast = index === lesson.words.length - 1;

  const move = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => Math.max(0, Math.min(lesson.words.length - 1, i + delta)));
    },
    [lesson.words.length],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input, textarea")) return;
      if (event.key === " ") {
        event.preventDefault();
        setFlipped((v) => !v);
      } else if (event.key === "ArrowRight") move(1);
      else if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <>
      <FocusBar exitHref={exitHref} title={title} done={index + 1} total={lesson.words.length} />
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
        <p className="eyebrow text-center">Bước 1 · Làm quen từ mới</p>
        <Flashcard
          key={word.id}
          word={word}
          flipped={flipped}
          showReading
          onFlip={() => {
            if (!flipped) speakJapanese(word.reading);
            setFlipped((v) => !v);
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" disabled={index === 0} onClick={() => move(-1)}>
            <ArrowLeft className="size-4" aria-hidden /> Trước
          </Button>
          {isLast ? (
            <Button onClick={onFinish}>
              Làm bài kiểm tra <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button onClick={() => move(1)}>
              Từ tiếp theo <ArrowRight className="size-4" aria-hidden />
            </Button>
          )}
        </div>
        <p className="hidden text-center text-xs text-muted sm:block">Phím tắt: Space lật thẻ · ← → chuyển từ</p>
      </div>
    </>
  );
}

function QuizStep({
  questions,
  exitHref,
  title,
  onFinish,
}: {
  questions: Question[];
  exitHref: string;
  title: string;
  onFinish: () => void;
}) {
  const [queue, setQueue] = useState(questions);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const question = queue[0];
  const answered = picked !== null;
  const isCorrect = picked === question.word.id;

  const pick = useCallback(
    (id: string) => {
      if (answered) return;
      setPicked(id);
      if (id === question.word.id) setCorrectCount((c) => c + 1);
      speakJapanese(question.word.reading);
    },
    [answered, question.word],
  );

  const next = useCallback(() => {
    // Câu sai quay lại cuối hàng: phải trả lời đúng mọi từ mới xong bài.
    const rest = queue.slice(1);
    const nextQueue = isCorrect ? rest : [...rest, question];
    setPicked(null);
    if (nextQueue.length === 0) onFinish();
    else setQueue(nextQueue);
  }, [isCorrect, onFinish, question, queue]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (answered && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        next();
      } else if (!answered && /^[1-4]$/.test(event.key)) {
        const option = question.options[Number(event.key) - 1];
        if (option) pick(option.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, next, pick, question.options]);

  return (
    <>
      <FocusBar exitHref={exitHref} title={title} done={correctCount} total={questions.length} />
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
        <p className="eyebrow text-center">Bước 2 · Kiểm tra</p>
        <div className="panel space-y-2 p-6 text-center">
          <p className="text-sm text-muted">{question.kind === "meaning" ? "Từ này nghĩa là gì?" : "Từ nào có nghĩa này?"}</p>
          {question.kind === "meaning" ? (
            <p className="jp text-4xl font-bold" lang="ja">{question.word.word}</p>
          ) : (
            <p className="text-xl font-semibold">{meaningLine(question.word)}</p>
          )}
          {answered && question.word.reading !== question.word.word && (
            <p className="jp text-muted">{question.word.reading}</p>
          )}
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {question.options.map((option, index) => {
            const right = answered && option.id === question.word.id;
            const wrong = answered && option.id === picked && !right;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => pick(option.id)}
                  className={cn(
                    "panel flex min-h-16 w-full items-center gap-3 p-3 text-left transition-colors",
                    !answered && "hover:border-primary/40",
                    right && "border-success bg-success-soft",
                    wrong && "border-danger bg-danger-soft",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-subtle text-xs font-semibold text-muted">
                    {right ? <Check className="size-4 text-success" aria-label="Đúng" /> : wrong ? <X className="size-4 text-danger" aria-label="Sai" /> : index + 1}
                  </span>
                  {question.kind === "meaning" ? (
                    <span className="min-w-0 text-sm">{meaningLine(option)}</span>
                  ) : (
                    <span className="jp text-lg font-semibold" lang="ja">{option.word}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {answered && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={cn("font-semibold", isCorrect ? "text-success" : "text-danger")}>
              {isCorrect ? "Chính xác!" : `Chưa đúng — đáp án: ${question.word.word}. Từ này sẽ hỏi lại cuối bài.`}
            </p>
            <Button onClick={next}>
              Tiếp tục <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function DoneStep({ lesson, exitHref }: { lesson: LessonDetail; exitHref: string }) {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const [saveFailed, setSaveFailed] = useState(false);
  const nextNo = lesson.no < lesson.totalLessons ? lesson.no + 1 : null;
  const wordIds = lesson.words.map((w) => w.id);
  const level = lesson.level;
  const next = `/hoc-tu/${level.toLowerCase()}/${lesson.no + 1}`;

  const [attempt, setAttempt] = useState(0);

  // Lưu một lần khi hoàn thành bài (gọi lại không tạo trùng: từ đã có giữ nguyên lịch ôn).
  useEffect(() => {
    if (!user) {
      rememberPendingWords(wordIds);
      return;
    }
    api("/study/words", { method: "POST", json: { wordIds, learned: true } })
      .then(() =>
        mutate(
          (key) => typeof key === "string" && (key.startsWith("/study/") || key.startsWith("/vocab/")),
          undefined,
          { revalidate: true },
        ),
      )
      .catch(() => setSaveFailed(true));
    // wordIds cố định trong suốt bước này: mỗi bài tạo component mới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, attempt]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-14 text-center">
      <span className="jp flex size-20 items-center justify-center rounded-2xl bg-primary-soft text-4xl font-bold text-primary">合</span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Xong {level} · Bài {lesson.no}!</h1>
        <p className="text-muted">
          {user
            ? `${lesson.words.length} từ đã vào sổ ôn. GODA sẽ nhắc bạn ôn lại đúng lúc sắp quên.`
            : `Bạn vừa học ${lesson.words.length} từ. Tạo tài khoản để GODA nhắc ôn lại đúng lúc sắp quên — tiến độ bài này sẽ được giữ lại.`}
        </p>
      </div>
      {saveFailed && (
        <ErrorNotice
          message="Chưa lưu được tiến độ."
          action={<button type="button" className="font-semibold underline" onClick={() => { setSaveFailed(false); setAttempt((n) => n + 1); }}>Thử lại</button>}
        />
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {!user && <ButtonLink href={`/register?next=${encodeURIComponent(exitHref)}`}>Tạo tài khoản miễn phí</ButtonLink>}
        {nextNo && (
          <ButtonLink href={next} variant={user ? "primary" : "secondary"}>
            Học bài {nextNo} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        )}
        <ButtonLink href={exitHref} variant="secondary">Về danh sách bài</ButtonLink>
      </div>
      {user && (
        <Link href="/on-tap" className="min-h-9 text-sm text-muted hover:text-foreground">
          Xem lịch ôn tập
        </Link>
      )}
    </div>
  );
}
