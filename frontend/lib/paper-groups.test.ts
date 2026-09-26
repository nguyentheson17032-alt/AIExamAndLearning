import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupPapers, paperGroupById, paperGroupId } from "./paper-groups";
import type { Paper } from "./types";

describe("paper groups", () => {
  it("puts tuyển sinh set papers in the admission group", () => {
    assert.equal(
      paperGroupId(
        { title: "Đề 01", description: null, kind: "EXAM", paperSetId: "set-1" },
        "Bộ 30 đề Toán tuyển sinh 10",
      ),
      "admission",
    );
  });

  it("puts TNTHPT papers in the graduation group", () => {
    assert.equal(
      paperGroupId(
        { title: "Đề Toán TNTHPT 2025", description: null, kind: "EXAM", paperSetId: "set-2" },
        "Bộ đề tốt nghiệp THPT",
      ),
      "tnthpt",
    );
  });

  it("puts practice papers in the practice group", () => {
    assert.equal(
      paperGroupId(
        { title: "Luyện Phần I", description: "tuyển sinh", kind: "PRACTICE", paperSetId: null },
        null,
      ),
      "practice",
    );
  });

  it("puts thi thử TN papers in the graduation group", () => {
    assert.equal(
      paperGroupId(
        { title: "Đề thi thử TN 2025 môn Toán", description: null, kind: "EXAM", paperSetId: null },
        null,
      ),
      "tnthpt",
    );
    assert.equal(
      paperGroupId(
        {
          title: "Bo-de-thi-thu-TN-2025-mon-Toan-Cau-truc-moi",
          description: null,
          kind: "EXAM",
          paperSetId: null,
        },
        null,
      ),
      "tnthpt",
    );
  });

  it("puts standalone question-bank papers in the question group", () => {
    assert.equal(
      paperGroupId(
        { title: "Kiểm tra 15 phút", description: null, kind: "ASSIGNMENT", paperSetId: null },
        null,
      ),
      "question",
    );
  });

  it("finds a group by id", () => {
    assert.equal(paperGroupById("admission")?.title, "Đề tuyển sinh");
    assert.equal(paperGroupById("missing"), null);
  });

  it("sorts a set by exam number", () => {
    const grouped = groupPapers(
      [paper("b", 2, "set-1"), paper("a", 1, "set-1")],
      new Map([["set-1", "Bộ đề tuyển sinh"]]),
    );
    assert.deepEqual(
      grouped.admission.map((item) => item.examNumber),
      [1, 2],
    );
  });
});

function paper(title: string, examNumber: number, paperSetId: string): Paper {
  return {
    id: title,
    authorId: "author",
    subjectId: "subject",
    paperSetId,
    examNumber,
    title,
    description: null,
    kind: "EXAM",
    source: "MANUAL",
    durationMinutes: 90,
    targetEloMin: 800,
    targetEloMax: 1400,
    status: "PUBLISHED",
    questions: [],
    createdAt: "2026-09-27T00:00:00Z",
  };
}
