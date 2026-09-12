import { startAttemptAction } from "@/lib/paper-actions";

export function StartAttemptButton({ paperId }: { paperId: string }) {
  return (
    <form action={startAttemptAction.bind(null, paperId)}>
      <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
        Start attempt
      </button>
    </form>
  );
}
