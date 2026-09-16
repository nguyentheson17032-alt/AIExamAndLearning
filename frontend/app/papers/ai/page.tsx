import { AiPracticeForm } from "@/components/ai-practice-form";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { PageResponse, Subject } from "@/lib/types";

export default async function AiPracticePaperPage() {
  await requireTeacher();
  const subjects = await backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100");
  return (
    <>
      <PageHeader
        title="AI practice paper"
        description="Lấy câu hỏi bất kỳ trong kho đề. Câu đúng/sai gồm đủ 4 ý a–d."
      />
      <AiPracticeForm subjects={subjects.content} />
    </>
  );
}
