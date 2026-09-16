import type { PaperItem } from "./types";

export type ExamStep = {
  groupKey: string;
  sectionTitle: string;
  items: PaperItem[];
};

export type ExamNavItem = {
  questionId: string;
  questionIds: string[];
  label: string;
  stepIndex: number;
};

export function isAnswered(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function isStepAnswered(item: ExamNavItem, answers: Record<string, string>): boolean {
  return item.questionIds.every((questionId) => isAnswered(answers[questionId]));
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
  return steps.map((step, stepIndex) => ({
    questionId: step.items[0].questionId,
    questionIds: step.items.map((item) => item.questionId),
    label: stepNavLabel(step),
    stepIndex,
  }));
}

function stepNavLabel(step: ExamStep): string {
  const first = step.items[0];
  if (step.items.length > 1 && first.groupKey) {
    return first.groupKey;
  }
  return first.itemLabel || step.groupKey;
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
