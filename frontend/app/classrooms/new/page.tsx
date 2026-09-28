import { ClassroomCreateForm } from "@/components/classroom-create-form";
import { PageHeader } from "@/components/page-header";
import { requireTeacher } from "@/lib/guards";

export default async function NewClassroomPage() {
  await requireTeacher();
  return (
    <>
      <PageHeader title="Tạo lớp" description="Học sinh chỉ thấy bài sau khi bạn thêm họ vào lớp." />
      <ClassroomCreateForm />
    </>
  );
}
