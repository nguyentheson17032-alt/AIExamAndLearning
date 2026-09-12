import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { examSteps } from "./exam-steps";
import type { PaperItem, Question } from "./types";

function item(partial: Partial<PaperItem> & { questionId: string; sortOrder: number }): PaperItem {
  const question = {
    id: partial.questionId,
    type: "MULTIPLE_CHOICE",
    stem: "stem",
    choices: [],
  } as unknown as Question;
  return {
    points: 0.25,
    sectionCode: "PART_I",
    sectionTitle: "Phần I",
    itemLabel: null,
    groupKey: null,
    question,
    ...partial,
  };
}

describe("examSteps", () => {
  it("groups part II items that share a group key", () => {
    const steps = examSteps([
      item({ questionId: "a", sortOrder: 1, groupKey: "I.1" }),
      item({
        questionId: "b",
        sortOrder: 2,
        groupKey: "II.1",
        sectionCode: "PART_II",
        sectionTitle: "Phần II",
      }),
      item({
        questionId: "c",
        sortOrder: 3,
        groupKey: "II.1",
        sectionCode: "PART_II",
        sectionTitle: "Phần II",
      }),
    ]);
    assert.equal(steps.length, 2);
    assert.equal(steps[1].items.length, 2);
    assert.equal(steps[1].sectionTitle, "Phần II");
  });
});
