import type { Paper, PaperKind } from "./types";

export type PaperGroupId = "admission" | "tnthpt" | "practice" | "question";

export const PAPER_GROUPS: { id: PaperGroupId; code: string; title: string; description: string }[] = [
  {
    id: "admission",
    code: "TS",
    title: "Đề tuyển sinh",
    description: "Đề và bộ đề tuyển sinh vào lớp 10.",
  },
  {
    id: "tnthpt",
    code: "TNTHPT",
    title: "Đề TNTHPT",
    description: "Đề thi tốt nghiệp trung học phổ thông.",
  },
  {
    id: "practice",
    code: "PRACTICE",
    title: "Đề practice",
    description: "Đề luyện tập và đề tạo theo Elo.",
  },
  {
    id: "question",
    code: "QUESTION",
    title: "Đề question",
    description: "Đề ghép từ ngân hàng câu hỏi.",
  },
];

export function paperGroupById(id: string) {
  return PAPER_GROUPS.find((group) => group.id === id) ?? null;
}

type GroupablePaper = {
  title: string;
  description: string | null;
  kind: PaperKind;
  paperSetId: string | null;
};

export function paperGroupId(paper: GroupablePaper, setTitle: string | null): PaperGroupId {
  if (paper.kind === "PRACTICE") {
    return "practice";
  }
  const haystack = fold([setTitle, paper.title, paper.description].filter(Boolean).join(" "));
  const admission = isAdmission(haystack);
  const graduation = isGraduation(haystack);
  if (admission && !graduation) {
    return "admission";
  }
  if (graduation && !admission) {
    return "tnthpt";
  }
  if (admission) {
    return "admission";
  }
  return "question";
}

export function groupPapers(papers: Paper[], setTitleById: Map<string, string>): Record<PaperGroupId, Paper[]> {
  const grouped: Record<PaperGroupId, Paper[]> = {
    admission: [],
    tnthpt: [],
    practice: [],
    question: [],
  };
  for (const paper of papers) {
    const setTitle = paper.paperSetId ? (setTitleById.get(paper.paperSetId) ?? null) : null;
    grouped[paperGroupId(paper, setTitle)].push(paper);
  }
  for (const id of Object.keys(grouped) as PaperGroupId[]) {
    grouped[id].sort(comparePapers);
  }
  return grouped;
}

function comparePapers(a: Paper, b: Paper): number {
  const examNumberA = a.examNumber ?? Number.MAX_SAFE_INTEGER;
  const examNumberB = b.examNumber ?? Number.MAX_SAFE_INTEGER;
  if (examNumberA !== examNumberB) {
    return examNumberA - examNumberB;
  }
  return a.title.localeCompare(b.title, "vi");
}

function isAdmission(value: string): boolean {
  return /tuyen sinh|ts10|vao lop 10|vao 10/.test(value);
}

function isGraduation(value: string): boolean {
  return /tnthpt|tn[\s-]*thpt|tot nghiep|thpt quoc gia|\bthpt\b|\btn\b/.test(value);
}

function fold(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
