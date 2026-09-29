import type { Paper, PaperItem } from "./types";

export type ExamSection = "PART_I" | "PART_II" | "PART_III";

export const EXAM_PARTS = [
  { section: "PART_I" as const, title: "Phần I", required: 12, points: 0.25, minutesEach: 2 },
  { section: "PART_II" as const, title: "Phần II", required: 4, points: 0.25, minutesEach: 6 },
  { section: "PART_III" as const, title: "Phần III", required: 6, points: 0.5, minutesEach: 3 },
];

export function examDurationMinutes(): number {
  return EXAM_PARTS.reduce((total, part) => total + part.required * part.minutesEach, 0);
}

export type BankQuestion = {
  id: string;
  stem: string;
  stemImageId: string | null;
  eloRating: number;
  choiceCount: number;
};

export type BankGroup = {
  id: string;
  questionIds: string[];
  items: BankQuestion[];
};

export type SubjectBank = {
  subjectId: string;
  partOne: BankQuestion[];
  partTwo: BankGroup[];
  partThree: BankQuestion[];
};

export type ExamQuestionPayload = {
  questionId: string;
  points: number;
  section: ExamSection;
  sectionTitle: string;
  itemLabel: string;
  groupKey: string | null;
};

const PART_II_SIZE = 4;

export function examBanks(papers: Paper[]): SubjectBank[] {
  const bySubject = new Map<string, SubjectBank>();
  const seenGroups = new Map<string, Set<string>>();

  for (const paper of papers) {
    if (!paper.paperSetId) {
      continue;
    }
    const bank = bankFor(bySubject, paper.subjectId);
    const seen = seenFor(seenGroups, paper.subjectId);
    for (const item of paper.questions) {
      if (item.sectionCode === "PART_I") {
        addQuestion(bank.partOne, item);
      } else if (item.sectionCode === "PART_III") {
        addQuestion(bank.partThree, item);
      }
    }
    for (const group of partTwoGroups(paper)) {
      if (seen.has(group.id)) {
        continue;
      }
      seen.add(group.id);
      bank.partTwo.push(group);
    }
  }

  return [...bySubject.values()];
}

export function examSelectionError(partOne: number, partTwo: number, partThree: number): string | null {
  const gaps = EXAM_PARTS.flatMap((part) => {
    const selected = part.section === "PART_I" ? partOne : part.section === "PART_II" ? partTwo : partThree;
    return selected === part.required ? [] : [`${part.title} cần đúng ${part.required} câu (đang chọn ${selected})`];
  });
  return gaps.length === 0 ? null : `${gaps.join(". ")}.`;
}

export function buildExamQuestions(input: {
  partOneIds: string[];
  partTwoGroups: string[][];
  partThreeIds: string[];
}): { error: string } | { questions: ExamQuestionPayload[]; durationMinutes: number } {
  const error = examSelectionError(input.partOneIds.length, input.partTwoGroups.length, input.partThreeIds.length);
  if (error) {
    return { error };
  }
  if (input.partTwoGroups.some((group) => group.length !== PART_II_SIZE)) {
    return { error: "Mỗi câu Phần II phải đủ 4 ý a–d." };
  }

  const questions: ExamQuestionPayload[] = [
    ...input.partOneIds.map((questionId, index) => item(questionId, "PART_I", `I.${index + 1}`, null)),
    ...input.partTwoGroups.flatMap((group, groupIndex) => {
      const groupKey = `II.${groupIndex + 1}`;
      return group.map((questionId, index) =>
        item(questionId, "PART_II", `${groupKey}${String.fromCharCode(97 + index)}`, groupKey),
      );
    }),
    ...input.partThreeIds.map((questionId, index) => item(questionId, "PART_III", `III.${index + 1}`, null)),
  ];
  return { questions, durationMinutes: examDurationMinutes() };
}

function item(questionId: string, section: ExamSection, itemLabel: string, groupKey: string | null): ExamQuestionPayload {
  const part = EXAM_PARTS.find((entry) => entry.section === section) ?? EXAM_PARTS[0];
  return {
    questionId,
    points: part.points,
    section,
    sectionTitle: part.title,
    itemLabel,
    groupKey,
  };
}

function bankFor(bySubject: Map<string, SubjectBank>, subjectId: string): SubjectBank {
  const existing = bySubject.get(subjectId);
  if (existing) {
    return existing;
  }
  const created: SubjectBank = { subjectId, partOne: [], partTwo: [], partThree: [] };
  bySubject.set(subjectId, created);
  return created;
}

function seenFor(seenGroups: Map<string, Set<string>>, subjectId: string): Set<string> {
  const existing = seenGroups.get(subjectId);
  if (existing) {
    return existing;
  }
  const created = new Set<string>();
  seenGroups.set(subjectId, created);
  return created;
}

function addQuestion(list: BankQuestion[], item: PaperItem) {
  if (list.some((question) => question.id === item.questionId)) {
    return;
  }
  list.push(toBankQuestion(item));
}

function partTwoGroups(paper: Paper): BankGroup[] {
  const byKey = new Map<string, PaperItem[]>();
  for (const item of paper.questions) {
    if (item.sectionCode !== "PART_II" || !item.groupKey) {
      continue;
    }
    const rows = byKey.get(item.groupKey) ?? [];
    rows.push(item);
    byKey.set(item.groupKey, rows);
  }
  const groups: BankGroup[] = [];
  for (const rows of byKey.values()) {
    const unique = new Map<string, PaperItem>();
    rows
      .toSorted((a, b) => a.sortOrder - b.sortOrder)
      .forEach((row) => {
        if (!unique.has(row.questionId)) {
          unique.set(row.questionId, row);
        }
      });
    if (unique.size !== PART_II_SIZE) {
      continue;
    }
    const items = [...unique.values()];
    const questionIds = items.map((row) => row.questionId);
    groups.push({
      id: [...questionIds].toSorted().join(","),
      questionIds,
      items: items.map(toBankQuestion),
    });
  }
  return groups;
}

function toBankQuestion(item: PaperItem): BankQuestion {
  return {
    id: item.questionId,
    stem: item.question.stem,
    stemImageId: item.question.stemImageId ?? null,
    eloRating: item.question.eloRating,
    choiceCount: item.question.choices.length,
  };
}
