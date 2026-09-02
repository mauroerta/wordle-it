import {
  defineRailway,
  github,
  postgres,
  preserve,
  project,
  service,
} from "railway/iac";

export default defineRailway(() => {
  const db = postgres("postgres");

  const web = service("parle", {
    source: github("mauroerta/wordle-it", { branch: "main" }),
    build: "npm run build",
    start: "npm start",
    replicas: { "europe-west4-drams3a": 1 },
    env: {
      DATABASE_URL: db.env.DATABASE_URL,
      WORKOS_CLIENT_ID: preserve(),
      WORKOS_API_KEY: preserve(),
      WORKOS_COOKIE_PASSWORD: preserve(),
      WORKOS_REDIRECT_URI: preserve(),
    },
  });

  return project("parle", {
    resources: [db, web],
  });
});
