const IMG = /(\[\[img:[^\]]+\]\])/g;
const INLINE_CHOICES = /\sA\.\s/;
const SNAPSHOT = /\[\[img:(\/ts10\/q\/[^\]]+)\]\]/;

export function questionSnapshotSrc(text: string): string | null {
  const match = SNAPSHOT.exec(text);
  return match ? match[1] : null;
}

export function promptStem(text: string, hasChoices = false): string {
  if (!hasChoices) {
    return text;
  }
  if (questionSnapshotSrc(text)) {
    return text;
  }
  const cut = INLINE_CHOICES.exec(text);
  return cut ? text.slice(0, cut.index).trim() : text;
}

export function StemText({ text, className = "" }: { text: string; className?: string }) {
  const snapshot = questionSnapshotSrc(text);
  if (snapshot) {
    return (
      <img
        src={snapshot}
        alt=""
        className={`block h-auto w-full max-w-3xl rounded-md bg-white ${className}`.trim()}
      />
    );
  }
  const parts = text.split(IMG);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        const match = /^\[\[img:([^\]]+)\]\]$/.exec(part);
        if (!match) {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {part}
            </span>
          );
        }
        return (
          <img
            key={index}
            src={match[1]}
            alt=""
            className="mx-1 my-1 inline-block h-auto max-h-32 max-w-full object-contain align-middle"
          />
        );
      })}
    </span>
  );
}
