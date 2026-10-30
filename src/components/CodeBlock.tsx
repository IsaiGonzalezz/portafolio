export function CodeBlock({ code, label }: { code: string; label: string }) {
  const lines = code.split("\n");
  return (
    <pre
      aria-label={label}
      className="on-dark overflow-x-auto rounded-lg bg-panel p-4 font-mono text-[0.8rem] leading-6 text-paper/90"
    >
      <code>
        {lines.map((line, i) => (
          <span
            key={i}
            className={`block ${line.trimStart().startsWith("--") ? "text-paper/45" : ""}`}
          >
            {line || " "}
          </span>
        ))}
      </code>
    </pre>
  );
}
