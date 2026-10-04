"use client";

import { useMemo } from "react";
import katex from "katex";

export function MathText({
  text,
  className = "",
  block = false,
}: {
  text: string;
  className?: string;
  block?: boolean;
}) {
  const renderedContent = useMemo(() => {
    if (!text) return "";
    return renderMathMarkdown(text);
  }, [text]);

  return (
    <span
      className={`math-content ${block ? "block" : "inline"} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

function renderKaTeX(formula: string, displayMode: boolean): string {
  try {
    // Clean common text-wrapped latex anomalies
    const clean = formula.trim();
    return katex.renderToString(clean, {
      displayMode,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return `<code class="font-mono text-xs px-1 py-0.5 rounded bg-muted/20">${escapeHtml(formula)}</code>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderMathMarkdown(content: string): string {
  if (!content) return "";

  // 1. Process Block Math: $$...$$
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    return `<div class="my-2.5 flex justify-center overflow-x-auto py-1">${renderKaTeX(math, true)}</div>`;
  });

  // 2. Process Inline Math: $...$ (avoiding \$)
  processed = processed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
    return `<span class="inline-math inline-block mx-0.5">${renderKaTeX(math, false)}</span>`;
  });

  // 3. Process Bold markdown **text**
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 4. Process newlines
  processed = processed.replace(/\n/g, '<br />');

  return processed;
}
