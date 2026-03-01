/**
 * Gera um UUID v7 (timestamp-ordered). Usado como default em colunas `id` dos schemas Drizzle.
 */
export const randomUUIDV7 = (): string => Bun.randomUUIDv7();
