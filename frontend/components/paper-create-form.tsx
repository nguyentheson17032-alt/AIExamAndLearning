"use client";

import { createPaperAction, type PaperFormState } from "@/lib/paper-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { StemText, promptStem } from "@/components/stem-text";
import {
  examBlueprint,
  examSelectionError,
  nextExamSection,
  requiredCount,
  type ExamSection,
  type BankGroup,
  type BankQuestion,
  type SubjectBank,
} from "@/lib/exam-bank";
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
  const [openPart, setOpenPart] = useState<ExamSection | null>(null);
  const subject = subjects.find((entry) => entry.id === subjectId) ?? null;
  const blueprint = subject ? examBlueprint(subject.name) : null;
  const bank = banks.find((entry) => entry.subjectId === subjectId) ?? null;
  const selectionError = !subjectId
    ? "Chọn môn."
    : !blueprint
      ? "Chưa có quy tắc đề cho môn này."
      : examSelectionError(blueprint, partOne.length, partTwo.length, partThree.length);

  function chooseSubject(next: string) {
    setSubjectId(next);
    setPartOne([]);
    setPartTwo([]);
    setPartThree([]);
    const chosen = subjects.find((entry) => entry.id === next);
    const rules = chosen ? examBlueprint(chosen.name) : null;
    setOpenPart(rules && rules.partOne > 0 ? "PART_I" : null);
  }

  function choose(section: ExamSection, current: string[], id: string, limit: number, apply: (next: string[]) => void) {
    const next = toggle(current, id, limit);
    apply(next);
    if (blueprint && next.length === limit && next.length > current.length) {
      setOpenPart(nextExamSection(blueprint, section));
    }
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
          {subjects.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </label>
      <input type="hidden" name="subjectName" value={subject?.name ?? ""} />
      {blueprint && bank ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">Thời gian làm bài: {blueprint.durationMinutes} phút.</p>
          {requiredCount(blueprint, "PART_I") > 0 ? (
            <PartPicker
              title="Phần I"
              required={blueprint.partOne}
              open={openPart === "PART_I"}
              onOpen={() => setOpenPart(openPart === "PART_I" ? null : "PART_I")}
              name="partOne"
              questions={bank.partOne}
              chosen={partOne}
              onToggle={(id) => choose("PART_I", partOne, id, blueprint.partOne, setPartOne)}
            />
          ) : null}
          {requiredCount(blueprint, "PART_II") > 0 ? (
            <GroupPicker
              title="Phần II"
              required={blueprint.partTwo}
              open={openPart === "PART_II"}
              onOpen={() => setOpenPart(openPart === "PART_II" ? null : "PART_II")}
              groups={bank.partTwo}
              chosen={partTwo}
              onToggle={(id) => choose("PART_II", partTwo, id, blueprint.partTwo, setPartTwo)}
            />
          ) : null}
          {requiredCount(blueprint, "PART_III") > 0 ? (
            <PartPicker
              title="Phần III"
              required={blueprint.partThree}
              open={openPart === "PART_III"}
              onOpen={() => setOpenPart(openPart === "PART_III" ? null : "PART_III")}
              name="partThree"
              questions={bank.partThree}
              chosen={partThree}
              onToggle={(id) => choose("PART_III", partThree, id, blueprint.partThree, setPartThree)}
            />
          ) : null}
        </div>
      ) : subjectId && !blueprint ? (
        <p className="text-sm text-muted">Chưa có quy tắc đề cho môn này.</p>
      ) : subjectId ? (
        <p className="text-sm text-muted">Môn này chưa có câu hỏi trong bộ đề đã tải lên.</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="targetEloMin" label="Elo tối thiểu" type="number" defaultValue={1000} min={100} required />
        <TextField name="targetEloMax" label="Elo tối đa" type="number" defaultValue={1400} min={100} required />
      </div>
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
  open,
  onOpen,
  name,
  questions,
  chosen,
  onToggle,
}: {
  title: string;
  required: number;
  open: boolean;
  onOpen: () => void;
  name: string;
  questions: BankQuestion[];
  chosen: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-2 rounded-lg border border-line p-3">
      <legend className="px-1">
        <button type="button" onClick={onOpen} className="text-sm font-medium">
          {title}: {chosen.length}/{required} câu
        </button>
      </legend>
      {open ? (
        questions.length === 0 ? (
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
        )
      ) : (
        chosen.map((id) => <input key={id} type="hidden" name={name} value={id} />)
      )}
    </fieldset>
  );
}

function GroupPicker({
  title,
  required,
  open,
  onOpen,
  groups,
  chosen,
  onToggle,
}: {
  title: string;
  required: number;
  open: boolean;
  onOpen: () => void;
  groups: BankGroup[];
  chosen: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-line p-3">
      <legend className="px-1">
        <button type="button" onClick={onOpen} className="text-sm font-medium">
          {title}: {chosen.length}/{required} câu, mỗi câu 4 ý
        </button>
      </legend>
      {open ? (
        groups.length === 0 ? (
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
        )
      ) : (
        chosen.map((value) => <input key={value} type="hidden" name="partTwo" value={value} />)
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
