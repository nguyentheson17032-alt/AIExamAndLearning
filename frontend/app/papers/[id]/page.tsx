import { PageHeader } from "@/components/page-header";
import { StartAttemptButton } from "@/components/start-attempt-button";
import { StemText, promptStem } from "@/components/stem-text";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { Paper } from "@/lib/types";

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const paper = await backendFetch<Paper>(`/api/v1/papers/${id}`);
  const items = paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder);
  const teacher = isTeacher(user);

  return (
    <>
      <PageHeader
        title={paper.title}
        description={`${paper.kind} · ${paper.durationMinutes} phút · Elo ${paper.targetEloMin}–${paper.targetEloMax} · ${items.length} câu hỏi`}
      >
        <StartAttemptButton paperId={id} />
      </PageHeader>
      {paper.description ? <p className="mb-6 text-sm text-muted">{paper.description}</p> : null}

      {teacher ? (
        <ol className="space-y-4">
          {items.map((item, index) => {
            const choices = item.question.choices ?? [];
            return (
              <li key={item.questionId} className="rounded-xl border border-line bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Câu {index + 1} · {item.question.type} · {item.points} điểm
                  </p>
                  {item.question.answerKey ? (
                    <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                      Key: {item.question.answerKey}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 text-base leading-relaxed text-foreground">
                  <StemText
                    text={promptStem(item.question.stem, choices.length > 0)}
                    imageId={item.question.stemImageId}
                  />
                </div>

                {choices.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`rounded-lg border p-3 text-sm transition-colors ${
                          choice.correct
                            ? "border-accent/40 bg-accent/10 font-medium text-accent"
                            : "border-line bg-surface/50 text-foreground"
                        }`}
                      >
                        <span className="mr-1.5 font-bold">{choice.label}.</span>
                        <StemText text={choice.content} />
                        {choice.correct ? (
                          <span className="ml-2 text-xs font-bold text-accent">(Đúng)</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : item.question.type === "SHORT_ANSWER" || item.question.type === "ESSAY" ? (
                  <div className="mt-3 rounded-lg border border-dashed border-line bg-surface/30 p-3 text-xs text-muted">
                    ✏️ Trả lời tự luận / điền đáp án
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Thông tin bài thi</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface/40 p-4">
              <p className="text-xs text-muted">Số lượng câu hỏi</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{items.length} câu</p>
            </div>
            <div className="rounded-xl border border-line bg-surface/40 p-4">
              <p className="text-xs text-muted">Thời gian làm bài</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{paper.durationMinutes} phút</p>
            </div>
            <div className="rounded-xl border border-line bg-surface/40 p-4">
              <p className="text-xs text-muted">Mức độ Elo</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {paper.targetEloMin} – {paper.targetEloMax}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-accent/30 bg-accent/5 p-4 text-sm text-foreground">
            <p className="font-medium text-accent">Lưu ý khi làm bài:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
              <li>Đề bài sẽ được hiển thị khi bạn bấm nút <strong>Làm đề</strong> ở góc trên.</li>
              <li>Thời gian {paper.durationMinutes} phút sẽ bắt đầu đếm ngược ngay sau khi bắt đầu.</li>
              <li>Bạn có thể chuyển câu hỏi và chỉnh sửa câu trả lời bất kỳ lúc nào trước khi nộp bài.</li>
              <li>Hệ thống sẽ tự động chấm điểm và cập nhật mức xếp hạng Elo ngay sau khi nộp bài.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
