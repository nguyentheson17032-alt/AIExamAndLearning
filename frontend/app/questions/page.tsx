import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StemText, promptStem } from "@/components/stem-text";
import { EXAM_PARTS, examBanks, type BankGroup, type BankQuestion } from "@/lib/exam-bank";
import { loadAllPapers } from "@/lib/load-papers";
import { requireTeacher } from "@/lib/guards";
import { backendFetch } from "@/lib/backend";
import type { PageResponse, Subject } from "@/lib/types";
import Link from "next/link";

export default async function QuestionsPage() {
  await requireTeacher();
  const [subjects, papers] = await Promise.all([
    backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100"),
    loadAllPapers(),
  ]);
  const nameById = new Map(subjects.content.map((subject) => [subject.id, subject.name]));
  const banks = examBanks(papers).toSorted((a, b) =>
    (nameById.get(a.subjectId) ?? a.subjectId).localeCompare(nameById.get(b.subjectId) ?? b.subjectId, "vi"),
  );

  return (
    <>
      <PageHeader title="Câu hỏi" description="Câu hỏi trong các bộ đề đã tải lên, chia theo môn và Phần I, II, III.">
        <Link href="/papers/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
          Tạo đề
        </Link>
      </PageHeader>
      {banks.length === 0 ? (
        <EmptyState title="Chưa có câu hỏi" description="Tải một bộ đề để xem câu hỏi theo từng phần." />
      ) : (
        <div className="space-y-10">
          {banks.map((bank) => (
            <section key={bank.subjectId} className="space-y-4">
              <h2 className="text-lg font-semibold">{nameById.get(bank.subjectId) ?? "Môn"}</h2>
              <PartList title={EXAM_PARTS[0].title} questions={bank.partOne} />
              <GroupList title={EXAM_PARTS[1].title} groups={bank.partTwo} />
              <PartList title={EXAM_PARTS[2].title} questions={bank.partThree} />
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function PartList({ title, questions }: { title: string; questions: BankQuestion[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium">
        {title} · {questions.length} câu
      </h3>
      {questions.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Chưa có câu.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {questions.map((question) => (
            <li key={question.id}>
              <Link href={`/questions/${question.id}`} className="block rounded-xl border border-line bg-card p-4 hover:border-accent">
                <StemText text={promptStem(question.stem, question.choiceCount > 0)} imageId={question.stemImageId} />
                <p className="mt-1 text-xs text-muted">Elo {question.eloRating}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GroupList({ title, groups }: { title: string; groups: BankGroup[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium">
        {title} · {groups.length} câu
      </h3>
      {groups.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Chưa có câu.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {groups.map((group, index) => (
            <li key={group.id} className="rounded-xl border border-line bg-card p-4">
              <p className="text-xs text-muted">Câu {index + 1}</p>
              <ol className="mt-2 space-y-2">
                {group.items.map((question, itemIndex) => (
                  <li key={question.id}>
                    <Link href={`/questions/${question.id}`} className="block hover:text-accent">
                      <span className="text-xs text-muted">{String.fromCharCode(97 + itemIndex)}.</span>{" "}
                      <StemText text={promptStem(question.stem, question.choiceCount > 0)} imageId={question.stemImageId} />
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
