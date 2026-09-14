import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { examNavItems, examSteps, examSubmitFormData, isAnswered } from "./exam-steps";
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
  it("lists each question with the step to open", () => {
    const steps = examSteps([
      item({ questionId: "a", sortOrder: 1, itemLabel: "I.1", groupKey: "I.1" }),
      item({
        questionId: "b",
        sortOrder: 2,
        itemLabel: "II.1a",
        groupKey: "II.1",
        sectionCode: "PART_II",
        sectionTitle: "Phần II",
      }),
      item({
        questionId: "c",
        sortOrder: 3,
        itemLabel: "II.1b",
        groupKey: "II.1",
        sectionCode: "PART_II",
        sectionTitle: "Phần II",
      }),
    ]);
    assert.deepEqual(examNavItems(steps), [
      { questionId: "a", label: "I.1", stepIndex: 0 },
      { questionId: "b", label: "II.1a", stepIndex: 1 },
      { questionId: "c", label: "II.1b", stepIndex: 1 },
    ]);
    assert.equal(isAnswered("  "), false);
    assert.equal(isAnswered("B"), true);
  });

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

  it("puts every answer into FormData even when some questions are not on screen", () => {
    const choice = item({ questionId: "a", sortOrder: 1 });
    const written = item({
      questionId: "b",
      sortOrder: 2,
      sectionCode: "PART_III",
      question: { id: "b", type: "SHORT_ANSWER", stem: "stem", choices: [] } as unknown as Question,
    });
    const formData = examSubmitFormData([choice, written], { a: "choice-1", b: " 12 " });
    assert.deepEqual(formData.getAll("questionId"), ["a", "b"]);
    assert.equal(formData.get("choice-a"), "choice-1");
    assert.equal(formData.get("text-b"), "12");
  });
});
