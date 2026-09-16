import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { correctAnswerText, submittedWork } from "./correct-answer";
import type { Choice, Question } from "./types";

function choice(partial: Partial<Choice> & Pick<Choice, "id" | "label" | "correct">): Choice {
  return {
    content: "",
    sortOrder: 1,
    ...partial,
  };
}

describe("correctAnswerText", () => {
  it("uses the correct choice, not a mismatched answerKey", () => {
    const question = {
      answerKey: "Đúng",
      choices: [
        choice({ id: "t", label: "Đ", content: "Đúng", correct: false, sortOrder: 1 }),
        choice({ id: "f", label: "S", content: "Sai", correct: true, sortOrder: 2 }),
      ],
    } as Question;
    assert.equal(correctAnswerText(question), "S. Sai");
  });

  it("falls back to answerKey when choices have no correct flag", () => {
    const question = {
      answerKey: "3",
      choices: [],
    } as unknown as Question;
    assert.equal(correctAnswerText(question), "3");
  });
});

describe("submittedWork", () => {
  it("shows selected label and content", () => {
    assert.equal(
      submittedWork(choice({ id: "t", label: "Đ", content: "Đúng", correct: false }), null),
      "Đ. Đúng",
    );
  });
});
