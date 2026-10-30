import { code128Bars, code128Length } from "@/lib/code128";

export function Code128({ value, className }: { value: string; className?: string }) {
  const len = code128Length(value);
  const pad = 10;
  const total = len + pad * 2;
  return (
    <svg
      role="img"
      aria-label={`Code 128: ${value}`}
      viewBox={`0 0 ${total} 40`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width={total} height="40" fill="#fbfbf8" />
      {code128Bars(value).map((b, i) => (
        <rect key={i} x={b.x + pad} y="0" width={b.w} height="40" fill="#111" />
      ))}
    </svg>
  );
}
