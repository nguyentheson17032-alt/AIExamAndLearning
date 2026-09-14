export type GenerateSection = "PART_I" | "PART_II" | "PART_III";

export const MAX_GENERATE_QUESTIONS = 99;
export const PART_III_ELO_MAX = 3000;

export function generateDurationMinutes(section: GenerateSection, questionCount: number): number {
  const count = Math.min(MAX_GENERATE_QUESTIONS, Math.max(1, questionCount));
  return count * minutesPerQuestion(section);
}

export function generateEloRange(section: GenerateSection): { min: number; max: number } {
  switch (section) {
    case "PART_I":
      return { min: 1000, max: 1100 };
    case "PART_II":
      return { min: 1100, max: 1200 };
    case "PART_III":
      return { min: 1200, max: PART_III_ELO_MAX };
  }
}

function minutesPerQuestion(section: GenerateSection): number {
  switch (section) {
    case "PART_I":
      return 2;
    case "PART_II":
      return 6;
    case "PART_III":
      return 3;
  }
}
