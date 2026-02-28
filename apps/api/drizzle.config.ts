import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { env } from './src/lib/env';

export default defineConfig({
    out: './src/db/migrations',
    schema: './src/db/schema/**',
    dialect: 'postgresql',
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
    casing: 'snake_case',
});
