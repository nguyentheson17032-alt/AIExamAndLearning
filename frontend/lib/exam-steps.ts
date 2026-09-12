import type { PaperItem } from "./types";

export type ExamStep = {
  groupKey: string;
  sectionTitle: string;
  items: PaperItem[];
};

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
