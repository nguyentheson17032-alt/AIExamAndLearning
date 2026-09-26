import { DocxExamImportForm } from "@/components/docx-exam-import-form";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { Subject } from "@/lib/types";
import Link from "next/link";

export default async function UploadExamPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const { id } = await params;
  const subject = await backendFetch<Subject>(`/api/v1/subjects/${id}`);
  return (
    <>
      <PageHeader
        title="Tải đề"
        description={`${subject.name} · File Word đúng dạng đề tuyển sinh: Phần I, II, III, rồi HẾT và lời giải.`}
      />
      <p className="mb-6 text-sm">
        <Link href={`/subjects/${id}`} className="text-accent hover:underline">
          ← Quay lại môn học
        </Link>
      </p>
      <DocxExamImportForm subjectId={id} />
    </>
  );
}
