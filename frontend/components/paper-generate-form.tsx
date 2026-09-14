"use client";

import { generatePaperAction, type PaperFormState } from "@/lib/paper-actions";
import {
  generateDurationMinutes,
  generateEloRange,
  MAX_GENERATE_QUESTIONS,
  type GenerateSection,
} from "@/lib/paper-generate";
import { ProblemAlert } from "@/components/problem-alert";
import { SelectField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import type { Subject } from "@/lib/types";
import { useActionState, useState } from "react";

const SECTION_OPTIONS: { value: GenerateSection; label: string }[] = [
  { value: "PART_I", label: "Phần I - Trắc nghiệm" },
  { value: "PART_II", label: "Phần II - Đúng/sai, 4 nhóm × 4 ý a–d" },
  { value: "PART_III", label: "Phần III - Tự luận ngắn" },
];

export function PaperGenerateForm({ subjects }: { subjects: Subject[] }) {
  const [state, action] = useActionState(generatePaperAction, null as PaperFormState);
  const [section, setSection] = useState<GenerateSection>("PART_I");
  const [questionCount, setQuestionCount] = useState(5);
  const elo = generateEloRange(section);
  const [eloMin, setEloMin] = useState(elo.min);
  const [eloMax, setEloMax] = useState(elo.max);
  const durationMinutes = generateDurationMinutes(section, questionCount);

  function changeSection(next: GenerateSection) {
    setSection(next);
    const range = generateEloRange(next);
    setEloMin(range.min);
    setEloMax(range.max);
  }

  return (
    <form action={action} className="max-w-lg space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="title" label="Title" />
      <SelectField
        name="subjectId"
        label="Subject"
        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} · ${subject.name}` }))}
      />
      <label className="block text-sm">
        <span className="font-medium">Kind</span>
        <select
          name="section"
          value={section}
          onChange={(event) => changeSection(event.target.value as GenerateSection)}
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2"
        >
          {SECTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium">
          {section === "PART_II" ? "Question count (số nhóm, mỗi nhóm 4 ý a–d)" : "Question count"}
        </span>
        <input
          name="questionCount"
          type="number"
          required
          min={1}
          max={MAX_GENERATE_QUESTIONS}
          value={questionCount}
          onChange={(event) => setQuestionCount(Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Duration (minutes)</span>
        <input
          name="durationMinutes"
          type="number"
          readOnly
          value={durationMinutes}
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Elo min</span>
          <input
            name="targetEloMin"
            type="number"
            min={100}
            value={eloMin}
            onChange={(event) => setEloMin(Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Elo max</span>
          <input
            name="targetEloMax"
            type="number"
            min={100}
            value={eloMax}
            onChange={(event) => setEloMax(Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2"
          />
        </label>
      </div>
      <SubmitButton>Generate from Elo range</SubmitButton>
    </form>
  );
}
