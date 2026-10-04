import { AiTutorHub } from "@/components/ai-tutor-hub";
import { requireTeacher } from "@/lib/guards";
import { backendFetch } from "@/lib/backend";
import type { PageResponse, Subject } from "@/lib/types";

export const metadata = {
  title: "AI Math Practice | Exam Warehouse",
  description: "Interactive AI Math Practice and step-by-step problem solver.",
};

export default async function AiTutorPage() {
  await requireTeacher();

  const page = await backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100").catch(() => null);
  const subjects: Subject[] = page?.content || [];

  return (
    <div className="py-2">
      <AiTutorHub initialSubjects={subjects} />
    </div>
  );
}
