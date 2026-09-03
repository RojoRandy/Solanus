import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Solanus = github("RojoRandy/Solanus", { checkSuites: false });

  const Postgres = postgres("Postgres", { region: "us-west2" });
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-west2", sizeMB: 5000 });

  const _comedorSolanusapi = service("@comedor-solanus/api", {
    source: Solanus,
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/api/Dockerfile",
      watchPatterns: ["/apps/api/**", "/packages/shared/**", "/pnpm-lock.yaml", "/pnpm-workspace.yaml"],
    },
    // Sin startCommand: el CMD del Dockerfile (node apps/api/dist/src/main.js) manda.
    preDeployCommand: "pnpm --filter @comedor-solanus/api exec prisma migrate deploy",
    healthcheckPath: "/api/health",
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "comedor-solanusapi" },
    env: {
      DATABASE_URL: preserve(),
      JWT_EXPIRATION: preserve(),
      JWT_REFRESH_EXPIRATION: preserve(),
      JWT_REFRESH_SECRET: preserve(),
      JWT_SECRET: preserve(),
      PORT: preserve(),
      UPLOADS_DIR: preserve(),
      UPLOADS_PUBLIC_PATH: preserve(),
      STORAGE_DRIVER: preserve(),
      S3_BUCKET: preserve(),
      S3_REGION: preserve(),
      S3_URL_TTL: preserve(),
      AWS_ACCESS_KEY_ID: preserve(),
      AWS_SECRET_ACCESS_KEY: preserve(),
      // Dominio público de la web (generado por `railway domain`) — para CORS.
      WEB_ORIGIN: "https://comedor-solanusweb-production.up.railway.app",
      SWAGGER_ENABLED: "false",
    },
  });

  const _comedorSolanusweb = service("@comedor-solanus/web", {
    source: Solanus,
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/web/Dockerfile",
      watchPatterns: ["/apps/web/**", "/packages/shared/**", "/pnpm-lock.yaml", "/pnpm-workspace.yaml"],
    },
    // Sin startCommand: el CMD de la imagen caddy:2-alpine (sirve /srv) manda.
    replicas: { "us-west2": 1 },
    networking: { privateNetworkEndpoint: "comedor-solanusweb" },
    env: {
      // Vite congela esto en el bundle al build — debe ser el dominio público
      // de la API (el navegador no resuelve *.railway.internal).
      VITE_API_URL: "https://comedor-solanusapi-production.up.railway.app/api",
    },
  });

  return project("Solanus", {
    resources: [_comedorSolanusapi, Postgres, _comedorSolanusweb, postgresVolume],
  });
});
