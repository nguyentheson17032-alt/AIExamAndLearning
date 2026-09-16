import type { Choice, Question } from "./types";

export function submittedWork(selected: Choice | undefined, textAnswer: string | null | undefined): string {
  if (selected) {
    if (selected.content && !selected.content.includes("[[img:")) {
      return `${selected.label}. ${selected.content}`;
    }
    return selected.label;
  }
  return textAnswer?.trim() || "Không trả lời";
}

export function correctAnswerText(question: Question): string {
  const correct = question.choices.find((choice) => choice.correct);
  if (correct) {
    return submittedWork(correct, null);
  }
  return question.answerKey?.trim() || "—";
}
