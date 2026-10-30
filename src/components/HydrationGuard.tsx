"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __hydrated?: boolean;
  }
}

/** Marca que React ya tomó control de la página. Si no ocurre, un aviso explica por qué. */
export function HydrationGuard() {
  useEffect(() => {
    window.__hydrated = true;
  }, []);
  return null;
}
