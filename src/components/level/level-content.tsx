import { CheckCircle2, Clock, FileText, PlayCircle, Settings2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorNotice } from "@/components/ui/feedback";
import { formatNumber, formatPercent } from "@/lib/format";
import { QUESTION_TYPES, SKILL_GROUPS, SOURCE_LABEL } from "@/lib/jlpt";
import { serverApi } from "@/lib/server-api";
import type { Catalog, ExamSummary, JlptLevel, SkillGroup } from "@/lib/types";
import { QuickPracticeButton, RandomExamButton } from "./start-buttons";

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
    <div className="space-y-12">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold">Đề thi thử</h2>
            <p className="text-sm text-muted">Làm như thi thật: tính giờ từng phần, chấm điểm và ước tính khả năng đỗ.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-5">
            <p className="font-semibold">Đề ngẫu nhiên</p>
            <p className="flex-1 text-sm text-muted">
              Ghép đề mới từ ngân hàng {formatNumber(overview?.totalQuestions ?? 0)} câu theo đúng cấu trúc {level}
              {overview ? ` (${overview.examQuestions} câu, ${overview.examMinutes} phút)` : ""}. Ưu tiên câu bạn chưa làm.
            </p>
            <RandomExamButton level={level} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Luyện theo dạng bài</h2>
            <p className="text-sm text-muted">Chọn xong là biết đúng sai và xem giải thích ngay.</p>
          </div>
          <ButtonLink href={`/practice?level=${level}`} variant="secondary" size="sm">
            <Settings2 className="size-4" /> Tuỳ chỉnh bài luyện
          </ButtonLink>
        </div>
        {groups.length === 0 ? (
          <EmptyState title="Chưa có câu hỏi cho cấp độ này" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {groups.map(({ group, types: groupTypes }) => (
              <div key={group} className="space-y-3">
                <h3 className="text-sm font-semibold">
                  <span className="jp">{SKILL_GROUPS[group].nameJa}</span>
                  <span className="ml-2 font-normal text-muted">{SKILL_GROUPS[group].nameVi}</span>
                </h3>
                <div className="space-y-2">
                  {groupTypes.map(({ type, count }) => (
                    <div key={type} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                      <div className="min-w-0 flex-1">
                        <p className="jp font-medium">{QUESTION_TYPES[type].nameJa}</p>
                        <p className="text-xs text-muted">
                          {QUESTION_TYPES[type].nameVi} · {formatNumber(count)} câu
                        </p>
                      </div>
                      <QuickPracticeButton level={level} type={type} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ExamCard({ exam }: { exam: ExamSummary }) {
  const progress = exam.progress;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/exams/${exam.slug}`} className="font-semibold hover:underline">
          {exam.title}
        </Link>
        <Badge tone={exam.source === "goda" ? "primary" : "neutral"}>{SOURCE_LABEL[exam.source] ?? exam.source}</Badge>
      </div>
      {exam.description && <p className="line-clamp-2 text-sm text-muted">{exam.description}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1"><FileText className="size-3.5" /> {exam.totalQuestions} câu</span>
        <span className="flex items-center gap-1"><Clock className="size-3.5" /> {exam.totalMinutes} phút</span>
        {progress && progress.attemptCount > 0 && (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> Đã thi {progress.attemptCount} lần · cao nhất {formatPercent(progress.bestPercent)}
          </span>
        )}
      </div>
      <div className="mt-auto flex gap-2 pt-1">
        {progress?.inProgressAttemptId ? (
          <ButtonLink href={`/attempts/${progress.inProgressAttemptId}`} size="sm">
            <PlayCircle className="size-4" /> Làm tiếp
          </ButtonLink>
        ) : (
          <ButtonLink href={`/exams/${exam.slug}`} size="sm">Vào đề</ButtonLink>
        )}
        <ButtonLink href={`/exams/${exam.slug}`} size="sm" variant="secondary">Chi tiết</ButtonLink>
      </div>
    </div>
  );
}
