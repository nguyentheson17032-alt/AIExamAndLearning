import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TopicCreateForm } from "@/components/topic-create-form";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { PageResponse, Subject, Topic } from "@/lib/types";

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const { id } = await params;
  const [subject, topics] = await Promise.all([
    backendFetch<Subject>(`/api/v1/subjects/${id}`),
    backendFetch<PageResponse<Topic>>(`/api/v1/subjects/${id}/topics?size=50`),
  ]);
  return (
    <>
      <PageHeader title={subject.name} description={subject.description ?? subject.code} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-medium">Topics</h2>
          {topics.content.length === 0 ? (
            <EmptyState title="No topics" description="Add a topic to group questions." />
          ) : (
            <ul className="space-y-2">
              {topics.content.map((topic) => (
                <li key={topic.id} className="rounded-lg border border-line bg-card px-4 py-3">
                  <p className="font-medium">{topic.name}</p>
                  {topic.description ? <p className="text-sm text-muted">{topic.description}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <TopicCreateForm subjectId={id} />
      </div>
    </>
  );
}
