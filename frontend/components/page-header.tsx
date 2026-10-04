export function PageHeader({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {typeof title === "string" ? <h1 className="text-2xl font-semibold tracking-tight">{title}</h1> : title}
        {description
          ? description.split("\n").map((line) => (
              <p key={line} className="mt-1 text-sm text-muted">
                {line}
              </p>
            ))
          : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
