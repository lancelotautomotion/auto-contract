// Load env files so `prisma db push` / `prisma generate` pick up DATABASE_URL.
// Next.js stores secrets in .env.local; standard Prisma CLI reads .env.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" }); // Next.js convention
dotenv.config({ path: ".env" });       // fallback

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
