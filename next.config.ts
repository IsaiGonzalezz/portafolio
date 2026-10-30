import os from "node:os";
import type { NextConfig } from "next";

// En desarrollo, Next bloquea el JavaScript cuando abres el sitio desde un origen que no sea
// localhost (por ejemplo, la IP de tu red o el nombre de tu equipo). Sin JavaScript la página
// se ve, pero las demos no responden y tampoco aparece un error. Aquí se permiten
// automáticamente todas las direcciones de este equipo.
function devOrigins(): string[] {
  const hosts = new Set<string>(["127.0.0.1", "localhost", "*.local", os.hostname()]);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const item of list ?? []) {
      if (item.family === "IPv4" || (item.family as unknown) === 4) hosts.add(item.address);
    }
  }
  for (const extra of process.env.ALLOWED_DEV_ORIGINS?.split(",") ?? []) {
    if (extra.trim()) hosts.add(extra.trim());
  }
  return [...hosts];
}

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: devOrigins(),
  async redirects() {
    return [{ source: "/", destination: "/es", permanent: false }];
  },
};

export default config;
