export type Kind = "professional" | "personal" | "school";

export const KINDS: Kind[] = ["professional", "personal", "school"];

export const PROJECT_KIND: Record<string, Kind> = {
  formulacion: "professional",
  reposteria: "personal",
  warden: "school",
  automatizacion: "school",
};

/** Cada categoría tiene su color: azul profesional, verde personal, amarillo escolar. */
export const KIND_STYLE: Record<
  Kind,
  { hex: string; inkHex: string; text: string; bg: string; border: string; softBorder: string; rowBar: string; hover: string; topBorder: string }
> = {
  professional: {
    hex: "#2f5fd0",
    inkHex: "#2f5fd0",
    text: "text-blue",
    bg: "bg-blue",
    border: "border-blue",
    softBorder: "border-blue/55",
    rowBar: "border-l-blue",
    hover: "hover:bg-blue",
    topBorder: "border-t-blue",
  },
  personal: {
    hex: "#17804d",
    inkHex: "#17804d",
    text: "text-green",
    bg: "bg-green",
    border: "border-green",
    softBorder: "border-green/55",
    rowBar: "border-l-green",
    hover: "hover:bg-green",
    topBorder: "border-t-green",
  },
  school: {
    hex: "#f2b01e",
    inkHex: "#8a5f00",
    text: "text-yellow-ink",
    bg: "bg-yellow",
    border: "border-yellow",
    softBorder: "border-yellow/80",
    rowBar: "border-l-yellow",
    hover: "hover:bg-yellow-ink",
    topBorder: "border-t-yellow",
  },
};

export const asKind = (k: string): Kind => (k === "personal" || k === "school" ? k : "professional");
