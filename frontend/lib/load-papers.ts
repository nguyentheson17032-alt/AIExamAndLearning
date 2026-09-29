import { backendFetch } from "@/lib/backend";
import type { PageResponse, Paper } from "@/lib/types";

export async function loadAllPapers(): Promise<Paper[]> {
  const papers: Paper[] = [];
  for (let page = 0; page < 20; page += 1) {
    const result = await backendFetch<PageResponse<Paper>>(`/api/v1/papers?size=20&page=${page}`);
    papers.push(...result.content);
    if (result.last || result.content.length === 0) {
      break;
    }
  }
  return papers;
}
