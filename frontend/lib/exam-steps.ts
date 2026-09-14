import type { PaperItem } from "./types";

export type ExamStep = {
  groupKey: string;
  sectionTitle: string;
  items: PaperItem[];
};

export type ExamNavItem = {
  questionId: string;
  label: string;
  stepIndex: number;
};

export function isAnswered(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function isWrittenQuestion(type: PaperItem["question"]["type"]): boolean {
  return type === "SHORT_ANSWER" || type === "ESSAY";
}

export function examSubmitFormData(items: PaperItem[], answers: Record<string, string>): FormData {
  const formData = new FormData();
  for (const item of items) {
    const value = answers[item.questionId]?.trim() ?? "";
    formData.append("questionId", item.questionId);
    if (isWrittenQuestion(item.question.type)) {
      formData.set(`text-${item.questionId}`, value);
    } else {
      formData.set(`choice-${item.questionId}`, value);
    }
  }
  return formData;
}

export function examNavItems(steps: ExamStep[]): ExamNavItem[] {
  return steps.flatMap((step, stepIndex) =>
    step.items.map((item) => ({
      questionId: item.questionId,
      label: item.itemLabel || step.groupKey,
      stepIndex,
    })),
  );
}

export function examSteps(items: PaperItem[]): ExamStep[] {
  const ordered = items.toSorted((a, b) => a.sortOrder - b.sortOrder);
  const steps: ExamStep[] = [];
  const index = new Map<string, ExamStep>();
  for (const item of ordered) {
    const groupKey = item.groupKey || item.questionId;
    const existing = index.get(groupKey);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    const step: ExamStep = {
      groupKey,
      sectionTitle: item.sectionTitle || partLabel(item.sectionCode),
      items: [item],
    };
    index.set(groupKey, step);
    steps.push(step);
  }
  return steps;
}

function partLabel(code: PaperItem["sectionCode"]): string {
  switch (code) {
    case "PART_I":
      return "Phần I";
    case "PART_II":
      return "Phần II";
    case "PART_III":
      return "Phần III";
    default:
      return "Câu hỏi";
  }
}
