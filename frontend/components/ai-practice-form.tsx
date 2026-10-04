"use client";

import { generateAiPracticeAction, type AiFormState } from "@/lib/ai-actions";
import {
  aiPracticeDurationMinutes,
  DEFAULT_AI_PRACTICE_QUESTIONS,
  MAX_AI_PRACTICE_QUESTIONS,
} from "@/lib/ai-practice";
import { ProblemAlert } from "@/components/problem-alert";
import { SelectField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import type { Subject } from "@/lib/types";
import { useActionState, useState } from "react";

export function AiPracticeForm({ subjects }: { subjects: Subject[] }) {
  const [state, action] = useActionState(generateAiPracticeAction, null as AiFormState);
  const [questionCount, setQuestionCount] = useState(DEFAULT_AI_PRACTICE_QUESTIONS);
  const durationMinutes = aiPracticeDurationMinutes(questionCount);
  return (
    <form action={action} className="max-w-lg space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <SelectField
        name="subjectId"
        label="Subject"
        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} · ${subject.name}` }))}
      />
      <label className="block text-sm">
        <span className="font-medium">Question count</span>
        <input
          name="questionCount"
          type="number"
          required
          min={1}
          max={MAX_AI_PRACTICE_QUESTIONS}
          value={questionCount}
          onChange={(event) => setQuestionCount(Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2"
        />
        <span className="mt-1 block text-xs text-muted">
          Lấy ngẫu nhiên từ kho đề. Tối đa 99. Câu đúng/sai luôn đủ 4 ý a–d.
        </span>
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
        <span className="mt-1 block text-xs text-muted">Tự tính: 30 giây / câu (số câu × 0.5 phút)</span>
      </label>
      <SubmitButton>AI practice paper</SubmitButton>
    </form>
  );
}
