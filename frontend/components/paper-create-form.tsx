"use client";

import { createPaperAction, type PaperFormState } from "@/lib/paper-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { StemText, promptStem } from "@/components/stem-text";
import { EXAM_PARTS, examDurationMinutes, examSelectionError, type BankGroup, type BankQuestion, type SubjectBank } from "@/lib/exam-bank";
import type { ClassroomSummary, Subject } from "@/lib/types";
import { useActionState, useState } from "react";

export function PaperCreateForm({
  subjects,
  banks,
  classrooms = [],
}: {
  subjects: Subject[];
  banks: SubjectBank[];
  classrooms?: ClassroomSummary[];
}) {
  const [state, action] = useActionState(createPaperAction, null as PaperFormState);
  const [subjectId, setSubjectId] = useState("");
  const [partOne, setPartOne] = useState<string[]>([]);
  const [partTwo, setPartTwo] = useState<string[]>([]);
  const [partThree, setPartThree] = useState<string[]>([]);
  const bank = banks.find((entry) => entry.subjectId === subjectId) ?? null;
  const selectionError = subjectId ? examSelectionError(partOne.length, partTwo.length, partThree.length) : "Chọn môn.";

  function chooseSubject(next: string) {
    setSubjectId(next);
    setPartOne([]);
    setPartTwo([]);
    setPartThree([]);
  }

  return (
    <form action={action} className="space-y-6 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="title" label="Tên đề" required />
      <label className="block text-sm">
        <span className="font-medium">Môn</span>
        <select
          name="subjectId"
          required
          value={subjectId}
          onChange={(event) => chooseSubject(event.target.value)}
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2"
        >
          <option value="">Chọn môn</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>
      {bank ? (
        <>
          <PartPicker
            title={EXAM_PARTS[0].title}
            required={EXAM_PARTS[0].required}
            selected={partOne.length}
            name="partOne"
            questions={bank.partOne}
            chosen={partOne}
            onToggle={(id) => setPartOne((current) => toggle(current, id, EXAM_PARTS[0].required))}
          />
          <GroupPicker
            title={EXAM_PARTS[1].title}
            required={EXAM_PARTS[1].required}
            groups={bank.partTwo}
            chosen={partTwo}
            onToggle={(id) => setPartTwo((current) => toggle(current, id, EXAM_PARTS[1].required))}
          />
          <PartPicker
            title={EXAM_PARTS[2].title}
            required={EXAM_PARTS[2].required}
            selected={partThree.length}
            name="partThree"
            questions={bank.partThree}
            chosen={partThree}
            onToggle={(id) => setPartThree((current) => toggle(current, id, EXAM_PARTS[2].required))}
          />
        </>
      ) : subjectId ? (
        <p className="text-sm text-muted">Môn này chưa có câu hỏi trong bộ đề đã tải lên.</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="targetEloMin" label="Elo tối thiểu" type="number" defaultValue={1000} min={100} required />
        <TextField name="targetEloMax" label="Elo tối đa" type="number" defaultValue={1400} min={100} required />
      </div>
      <p className="text-sm text-muted">Thời gian làm bài: {examDurationMinutes()} phút.</p>
      {classrooms.length > 0 ? (
        <label className="block text-sm">
          <span className="font-medium">Lớp học</span>
          <select name="classroomId" defaultValue="" className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2">
            <option value="">Không đưa vào lớp</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {selectionError ? <p className="text-sm text-muted">{selectionError}</p> : null}
      <SubmitButton disabled={selectionError !== null}>Tạo đề</SubmitButton>
    </form>
  );
}

function PartPicker({
  title,
  required,
  selected,
  name,
  questions,
  chosen,
  onToggle,
}: {
  title: string;
  required: number;
  selected: number;
  name: string;
  questions: BankQuestion[];
  chosen: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        {title}: chọn đủ {required} câu ({selected}/{required})
      </legend>
      {questions.length === 0 ? (
        <p className="text-sm text-muted">Chưa có câu trong phần này.</p>
      ) : (
        questions.map((question) => (
          <QuestionChoice
            key={question.id}
            name={name}
            value={question.id}
            question={question}
            checked={chosen.includes(question.id)}
            disabled={!chosen.includes(question.id) && chosen.length >= required}
            onToggle={onToggle}
          />
        ))
      )}
    </fieldset>
  );
}

function GroupPicker({
  title,
  required,
  groups,
  chosen,
  onToggle,
}: {
  title: string;
  required: number;
  groups: BankGroup[];
  chosen: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">
        {title}: chọn đủ {required} câu, mỗi câu 4 ý ({chosen.length}/{required})
      </legend>
      {groups.length === 0 ? (
        <p className="text-sm text-muted">Chưa có câu trong phần này.</p>
      ) : (
        groups.map((group, index) => {
          const value = group.questionIds.join(",");
          const checked = chosen.includes(value);
          return (
            <label key={group.id} className="block rounded-lg border border-line p-3 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  name="partTwo"
                  value={value}
                  checked={checked}
                  disabled={!checked && chosen.length >= required}
                  onChange={() => onToggle(value)}
                />
                Câu {index + 1}
              </span>
              <ol className="mt-2 space-y-2 pl-6">
                {group.items.map((question, itemIndex) => (
                  <li key={question.id}>
                    <span className="text-xs text-muted">{String.fromCharCode(97 + itemIndex)}.</span>{" "}
                    <StemText text={promptStem(question.stem, question.choiceCount > 0)} imageId={question.stemImageId} />
                  </li>
                ))}
              </ol>
            </label>
          );
        })
      )}
    </fieldset>
  );
}

function QuestionChoice({
  name,
  value,
  question,
  checked,
  disabled,
  onToggle,
}: {
  name: string;
  value: string;
  question: BankQuestion;
  checked: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onToggle(value)}
        className="mt-1"
      />
      <span>
        <StemText text={promptStem(question.stem, question.choiceCount > 0)} imageId={question.stemImageId} />
        <span className="block text-xs text-muted">Elo {question.eloRating}</span>
      </span>
    </label>
  );
}

function toggle(current: string[], id: string, limit: number): string[] {
  if (current.includes(id)) {
    return current.filter((value) => value !== id);
  }
  if (current.length >= limit) {
    return current;
  }
  return [...current, id];
}
