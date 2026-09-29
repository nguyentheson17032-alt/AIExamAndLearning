"use client";

import { StemText, promptStem } from "@/components/stem-text";
import type { BankGroup, BankQuestion, ExamSection, SubjectBank } from "@/lib/exam-bank";
import Link from "next/link";
import { useState } from "react";

const PARTS: { section: ExamSection; title: string }[] = [
  { section: "PART_I", title: "Phần I" },
  { section: "PART_II", title: "Phần II" },
  { section: "PART_III", title: "Phần III" },
];

export function QuestionBankBrowser({
  rows,
}: {
  rows: { id: string; name: string; bank: SubjectBank }[];
}) {
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [part, setPart] = useState<ExamSection | null>(null);
  const open = rows.find((row) => row.id === subjectId) ?? null;

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const selected = row.id === subjectId;
        return (
          <li key={row.id} className="rounded-xl border border-line bg-card">
            <button
              type="button"
              className="w-full px-5 py-4 text-left font-medium hover:text-accent"
              onClick={() => {
                setSubjectId(selected ? null : row.id);
                setPart(null);
              }}
            >
              {row.name}
            </button>
            {selected && open ? (
              <div className="space-y-2 border-t border-line px-5 py-4">
                {PARTS.map((entry) => {
                  const count = partCount(open.bank, entry.section);
                  const showing = part === entry.section;
                  return (
                    <div key={entry.section}>
                      <button
                        type="button"
                        className="text-sm font-medium hover:text-accent"
                        onClick={() => setPart(showing ? null : entry.section)}
                      >
                        {entry.title} · {count} câu
                      </button>
                      {showing ? <PartDetail bank={open.bank} section={entry.section} /> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function partCount(bank: SubjectBank, section: ExamSection): number {
  if (section === "PART_I") {
    return bank.partOne.length;
  }
  if (section === "PART_II") {
    return bank.partTwo.length;
  }
  return bank.partThree.length;
}

function PartDetail({ bank, section }: { bank: SubjectBank; section: ExamSection }) {
  if (section === "PART_II") {
    return bank.partTwo.length === 0 ? (
      <p className="mt-2 text-sm text-muted">Chưa có câu.</p>
    ) : (
      <ul className="mt-2 space-y-2">
        {bank.partTwo.map((group, index) => (
          <GroupCard key={group.id} group={group} index={index} />
        ))}
      </ul>
    );
  }
  const questions = section === "PART_I" ? bank.partOne : bank.partThree;
  return questions.length === 0 ? (
    <p className="mt-2 text-sm text-muted">Chưa có câu.</p>
  ) : (
    <ul className="mt-2 space-y-2">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </ul>
  );
}

function QuestionCard({ question }: { question: BankQuestion }) {
  return (
    <li>
      <Link href={`/questions/${question.id}`} className="block rounded-lg border border-line p-4 hover:border-accent">
        <StemText text={promptStem(question.stem, question.choiceCount > 0)} imageId={question.stemImageId} />
        <p className="mt-1 text-xs text-muted">Elo {question.eloRating}</p>
      </Link>
    </li>
  );
}

function GroupCard({ group, index }: { group: BankGroup; index: number }) {
  return (
    <li className="rounded-lg border border-line p-4">
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
  );
}
