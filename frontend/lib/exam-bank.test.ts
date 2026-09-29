import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildExamQuestions, examBanks, examDurationMinutes, examSelectionError } from "./exam-bank";
import type { Paper, PaperItem, Question } from "./types";

describe("exam bank", () => {
  it("keeps uploaded exam-set questions and splits them by subject and part", () => {
    const banks = examBanks([
      paper("set-1", "math", [
        item("q1", "PART_I", 1, null),
        item("q1", "PART_I", 2, null),
        item("s1", "PART_III", 3, null),
        ...group("II.1", ["a", "b", "c", "d"]),
      ]),
      paper("set-1", "physics", [item("p1", "PART_I", 1, null)]),
      paper(null, "math", [item("manual", "PART_I", 1, null)]),
    ]);

    assert.equal(banks.length, 2);
    assert.deepEqual(banks[0].partOne.map((question) => question.id), ["q1"]);
    assert.deepEqual(banks[0].partThree.map((question) => question.id), ["s1"]);
    assert.equal(banks[0].partTwo.length, 1);
    assert.deepEqual(banks[0].partTwo[0].questionIds, ["a", "b", "c", "d"]);
    assert.deepEqual(banks[1].partOne.map((question) => question.id), ["p1"]);
  });

  it("keeps one copy of the same Phần II group", () => {
    const same = group("II.1", ["a", "b", "c", "d"]);
    const banks = examBanks([
      paper("set-1", "math", same),
      paper("set-1", "math", group("II.9", ["d", "c", "b", "a"])),
    ]);
    assert.equal(banks[0].partTwo.length, 1);
  });

  it("requires 12, 4, and 6 questions", () => {
    assert.match(examSelectionError(11, 4, 6) ?? "", /Phần I cần đúng 12/);
    assert.equal(examSelectionError(12, 4, 6), null);
    assert.equal(examDurationMinutes(), 66);
  });

  it("labels a complete exam in part order", () => {
    const built = buildExamQuestions({
      partOneIds: Array.from({ length: 12 }, (_, index) => `i${index}`),
      partTwoGroups: Array.from({ length: 4 }, (_, group) => [`g${group}a`, `g${group}b`, `g${group}c`, `g${group}d`]),
      partThreeIds: Array.from({ length: 6 }, (_, index) => `s${index}`),
    });
    assert.ok(!("error" in built));
    if ("error" in built) {
      return;
    }
    assert.equal(built.questions[0].itemLabel, "I.1");
    assert.equal(built.questions[12].itemLabel, "II.1a");
    assert.equal(built.questions[15].groupKey, "II.1");
    assert.equal(built.questions.at(-1)?.itemLabel, "III.6");
    assert.equal(built.questions.length, 12 + 16 + 6);
  });
});

function paper(paperSetId: string | null, subjectId: string, questions: PaperItem[]): Paper {
  return {
    id: `${subjectId}-${paperSetId}-${questions[0]?.questionId ?? "empty"}`,
    authorId: "teacher",
    subjectId,
    paperSetId,
    examNumber: 1,
    title: "Đề",
    description: null,
    kind: "EXAM",
    source: "MANUAL",
    durationMinutes: 90,
    targetEloMin: 1000,
    targetEloMax: 1400,
    status: "PUBLISHED",
    questions,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: null,
  };
}

function item(id: string, sectionCode: PaperItem["sectionCode"], sortOrder: number, groupKey: string | null): PaperItem {
  return {
    questionId: id,
    sortOrder,
    points: 0.25,
    sectionCode,
    sectionTitle: sectionCode,
    itemLabel: id,
    groupKey,
    question: question(id),
  };
}

function group(groupKey: string, ids: string[]): PaperItem[] {
  return ids.map((id, index) => item(id, "PART_II", index + 1, groupKey));
}

function question(id: string): Question {
  return {
    id,
    authorId: "teacher",
    subjectId: "math",
    topicId: null,
    similarToQuestionId: null,
    type: "MULTIPLE_CHOICE",
    stem: id,
    answerKey: null,
    explanation: null,
    difficulty: "INTERMEDIATE",
    eloRating: 1050,
    bloomLevel: null,
    source: "UPLOAD",
    status: "PUBLISHED",
    choices: [],
    createdAt: "2026-01-01T00:00:00Z",
  };
}
