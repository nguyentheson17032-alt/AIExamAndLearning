import { requireTeacher } from "@/lib/guards";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Admin Dashboard · Exam Warehouse",
  description: "Trang quản trị hệ thống đào tạo, học sinh, giáo viên, lớp học và bộ đề AI",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireTeacher();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>Hệ thống</span>
            <span>/</span>
            <span className="font-semibold text-accent">Admin Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full">{children}</div>
    </div>
  );
}

