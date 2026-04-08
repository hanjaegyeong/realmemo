"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  fontFamily: "sans-serif",
});

export default function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(false);
        }
      })
      .catch(() => {
        setError(true);
      });
  }, [code]);

  if (error) {
    return (
      <pre className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600 overflow-x-auto">
        {code}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center rounded-lg border border-gray-200 bg-white p-4 overflow-x-auto"
    />
  );
}
