export const MAX_AI_PRACTICE_QUESTIONS = 99;
export const DEFAULT_AI_PRACTICE_QUESTIONS = 5;
export const AI_SECONDS_PER_QUESTION = 30;
export const AI_MINUTES_PER_QUESTION = AI_SECONDS_PER_QUESTION / 60;

export function aiPracticeDurationMinutes(questionCount: number): number {
  const count = Math.min(MAX_AI_PRACTICE_QUESTIONS, Math.max(1, questionCount));
  return Math.max(1, Math.round(count * AI_MINUTES_PER_QUESTION));
}
