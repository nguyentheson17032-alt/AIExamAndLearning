import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupPapers, paperGroupById, paperGroupId, paperOrderLabel } from "./paper-groups";
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

  it("orders a group by the earliest update, then labels đề số 1 through n+1", () => {
    const grouped = groupPapers(
      [
        paper("later", 9, "set-1", "2026-09-27T10:00:00Z"),
        paper("earlier", 1, "set-1", "2026-09-27T01:00:00Z"),
      ],
      new Map([["set-1", "Bộ đề tuyển sinh"]]),
    );
    assert.deepEqual(
      grouped.admission.map((item) => item.id),
      ["earlier", "later"],
    );
    assert.equal(paperOrderLabel(1), "Đề số 1");
    assert.equal(paperOrderLabel(2), "Đề số 2");
    assert.equal(paperOrderLabel(grouped.admission.length + 1), "Đề số 3");
  });
});

function paper(title: string, examNumber: number, paperSetId: string, updatedAt = "2026-09-27T00:00:00Z"): Paper {
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
    updatedAt,
  };
}
