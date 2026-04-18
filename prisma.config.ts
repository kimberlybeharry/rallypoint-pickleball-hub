import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // DIRECT_URL is the non-pooled connection string for Prisma CLI (db push, migrate).
    // Use the direct (non-pooled) URL from your Neon project dashboard.
    url: process.env.DIRECT_URL,
  },
});
