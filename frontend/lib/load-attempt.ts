import { ApiError, backendFetch } from "@/lib/backend";
import type { Attempt, Paper } from "@/lib/types";
import { redirect } from "next/navigation";

type AttemptSolution = {
  attempt: Attempt;
  paper: Paper;
};

async function missingAttempt<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      redirect("/me");
    }
    throw error;
  }
}

export function loadAttempt(id: string): Promise<Attempt> {
  return missingAttempt(() => backendFetch<Attempt>(`/api/v1/attempts/${id}`));
}

export function loadAttemptSolutions(id: string): Promise<AttemptSolution> {
  return missingAttempt(() => backendFetch<AttemptSolution>(`/api/v1/attempts/${id}/solutions`));
}
