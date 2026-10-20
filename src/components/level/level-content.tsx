import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorNotice } from "@/components/ui/feedback";
import { SectionHeader } from "@/components/ui/page-header";
import { formatNumber, formatPercent } from "@/lib/format";
import { QUESTION_TYPES, SKILL_GROUPS, SOURCE_LABEL } from "@/lib/jlpt";
import { serverApi } from "@/lib/server-api";
import type { Catalog, ExamSummary, JlptLevel, SkillGroup } from "@/lib/types";
import { QuickPracticeRow, RandomExamButton } from "./start-buttons";

/** "JLPT N4 — Đề thi thử số 1" → "Đề thi thử số 1" (đã ở trang N4 nên bỏ tiền tố). */
const shortTitle = (title: string, level: JlptLevel) => title.replace(new RegExp(`^JLPT ${level}\\s*[—–-]\\s*`), "");

export async function LevelContent({ level }: { level: JlptLevel }) {
  const [catalog, exams] = await Promise.all([
    serverApi<Catalog>("/catalog").catch(() => null),
    serverApi<ExamSummary[]>(`/exams?level=${level}`).catch(() => null),
  ]);
  if (!catalog || !exams) {
    return <ErrorNotice message="Không kết nối được máy chủ. Vui lòng thử lại sau ít phút." />;
  }
  const overview = catalog.levels.find((l) => l.level === level);
  const types = overview?.questionTypes ?? [];
  const groups = (Object.keys(SKILL_GROUPS) as SkillGroup[])
    .map((group) => ({ group, types: types.filter((t) => QUESTION_TYPES[t.type].group === group) }))
    .filter((g) => g.types.length > 0);

  return (
    <div className="space-y-14">
      <section className="space-y-5">
        <SectionHeader
          title="Đề thi thử"
          description="Làm như thi thật: tính giờ từng phần, chấm điểm và ước tính khả năng đỗ."
        />
        <Card className="divide-y divide-border">
          {exams.map((exam) => (
            <ExamRow key={exam.slug} exam={exam} level={level} />
          ))}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Đề ngẫu nhiên</p>
              <p className="mt-1 text-sm text-muted">
                Ghép đề mới từ ngân hàng {formatNumber(overview?.totalQuestions ?? 0)} câu theo đúng cấu trúc {level}
                {overview ? ` (${overview.examQuestions} câu, ${overview.examMinutes} phút)` : ""}, ưu tiên câu bạn chưa làm.
              </p>
            </div>
            <RandomExamButton level={level} />
          </div>
        </Card>
      </section>

      <section className="space-y-5">
        <SectionHeader
          title="Luyện theo dạng bài"
          description="Mỗi lượt 10 câu, chọn xong là biết đúng sai và xem giải thích ngay."
          actions={
            <ButtonLink href={`/practice?level=${level}`} variant="secondary" size="sm">
              Tuỳ chỉnh bài luyện
            </ButtonLink>
          }
        />
        {groups.length === 0 ? (
          <EmptyState title="Chưa có câu hỏi cho cấp độ này" />
        ) : (
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groups.map(({ group, types: groupTypes }) => (
              <Card key={group} className="overflow-hidden">
                <div className="flex items-baseline justify-between gap-2 border-b border-border bg-subtle/50 px-4 py-3">
                  <p className="text-sm font-semibold">
                    <span className="jp">{SKILL_GROUPS[group].nameJa}</span>
                    <span className="ml-2 font-normal text-muted">{SKILL_GROUPS[group].nameVi}</span>
                  </p>
                  <span className="text-xs text-muted tabular-nums">
                    {formatNumber(groupTypes.reduce((sum, t) => sum + t.count, 0))}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {groupTypes.map(({ type, count }) => (
                    <QuickPracticeRow key={type} level={level} type={type} available={count} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ExamRow({ exam, level }: { exam: ExamSummary; level: JlptLevel }) {
  const progress = exam.progress;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 p-5 sm:px-6">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/exams/${exam.slug}`} className="font-semibold hover:text-primary">
            {shortTitle(exam.title, level)}
          </Link>
          <Badge tone={exam.source === "goda" ? "primary" : "neutral"}>{SOURCE_LABEL[exam.source] ?? exam.source}</Badge>
          {progress?.inProgressAttemptId && <Badge tone="warning">Đang làm dở</Badge>}
        </div>
        <p className="text-sm text-muted">
          {exam.totalQuestions} câu · {exam.totalMinutes} phút · {exam.sections.length} phần thi
          {progress && progress.attemptCount > 0 && (
            <>
              {" · "}
              <span className="text-foreground">
                Đã thi {progress.attemptCount} lần, cao nhất {formatPercent(progress.bestPercent)}
              </span>
            </>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        <ButtonLink href={`/exams/${exam.slug}`} variant="ghost" size="sm">
          Chi tiết
        </ButtonLink>
        {progress?.inProgressAttemptId ? (
          <ButtonLink href={`/attempts/${progress.inProgressAttemptId}`} size="sm">
            Làm tiếp
          </ButtonLink>
        ) : (
          <ButtonLink href={`/exams/${exam.slug}`} size="sm">
            Làm đề
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
