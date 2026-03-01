# Implementação dos schemas Zentria — Resumo e checklist

## Resumo por to-do

### 1. Criar `lib/ids.ts` com randomUUIDV7

**Implementado:**
- Ficheiro [src/lib/ids.ts](../src/lib/ids.ts) que exporta `randomUUIDV7 = () => Bun.randomUUIDv7()`.
- Usado em todas as tabelas dos domínios (sports, evaluations, health, nutrition) na coluna `id` com `.$defaultFn(() => randomUUIDV7())`.

**Checklist:**
- [x] Helper exportado e importado com caminho `../../../lib/ids` a partir de `db/schema/<domínio>/`.
- [x] Nenhum `id` deixado sem `$defaultFn` nos novos schemas.

---

### 2. Domínio sports

**Implementado:**
- **sports** ([sports/sports.ts](../src/db/schema/sports/sports.ts)): `id`, `organizationId`, `name`, `slug`, `description`, `createdAt`. Índice único `(organization_id, slug)`.
- **sports_metrics** ([sports/sports_metrics.ts](../src/db/schema/sports/sports_metrics.ts)): `id`, `sportId`, `name`, `unit`, `type`, `order`, `createdAt`. Índice em `sport_id`.
- **athlete_sports** ([sports/athlete_sports.ts](../src/db/schema/sports/athlete_sports.ts)): `id`, `memberId`, `sportId`, `joinedAt`, `createdAt`. Índice único `(member_id, sport_id)`.
- [relations.ts](../src/db/schema/sports/relations.ts) e [index.ts](../src/db/schema/sports/index.ts).

**Checklist:**
- [x] FKs para `organizations` e `members` com `onDelete: "cascade"`.
- [x] Nomes em snake_case na BD (via drizzle.config `casing: 'snake_case'`).
- [x] Relations ligam sports → organization, sportsMetrics → sport, athleteSports → member e sport.

---

### 3. Domínio evaluations

**Implementado:**
- **evaluations** ([evaluations/evaluations.ts](../src/db/schema/evaluations/evaluations.ts)): `id`, `memberId`, `sportId`, `evaluatedAt`, `recordedBy` (user_id), `createdAt`. Índices em `member_id` e `sport_id`.
- **evaluation_results** ([evaluations/evaluation_results.ts](../src/db/schema/evaluations/evaluation_results.ts)): `id`, `evaluationId`, `sportMetricId`, `value` (decimal 18,4), `createdAt`. Índices em `evaluation_id` e `sport_metric_id`.
- [relations.ts](../src/db/schema/evaluations/relations.ts) e [index.ts](../src/db/schema/evaluations/index.ts).

**Checklist:**
- [x] Imports de `../auth` e `../sports` (sem dependência circular).
- [x] FKs com `onDelete: "cascade"` onde apropriado.
- [x] Tipo `value` como `decimal` para resultados numéricos.

---

### 4. Domínio health

**Implementado:**
- **injuries** ([health/injuries.ts](../src/db/schema/health/injuries.ts)): `id`, `memberId`, `description`, `status`, `fromDate`, `toDate`, `recordedBy` (opcional), `createdAt`, `updatedAt` com `$onUpdate`.
- [relations.ts](../src/db/schema/health/relations.ts) e [index.ts](../src/db/schema/health/index.ts).

**Checklist:**
- [x] `recordedBy` opcional com `onDelete: "set null"`.
- [x] Índices em `member_id` e `status` para consultas por atleta e estado.

---

### 5. Domínio nutrition

**Implementado:**
- **diet_plans** ([nutrition/diet_plans.ts](../src/db/schema/nutrition/diet_plans.ts)): `id`, `memberId`, `name`, `validFrom`, `validTo`, `createdBy` (opcional), `createdAt`. Índice em `member_id`.
- **diet_plan_items** ([nutrition/diet_plan_items.ts](../src/db/schema/nutrition/diet_plan_items.ts)): `id`, `dietPlanId`, `dayOfWeek` (0–6), `mealType`, `content`, `order`. Índice em `diet_plan_id`.
- [relations.ts](../src/db/schema/nutrition/relations.ts) e [index.ts](../src/db/schema/nutrition/index.ts).

**Checklist:**
- [x] FKs para `members` e `diet_plans` com cascade; `created_by` → users com set null.
- [x] `day_of_week` como integer para 0–6.

---

### 6. Atualizar `db/schema/index.ts`

**Implementado:**
- `export * from "./sports"`, `"./evaluations"`, `"./health"`, `"./nutrition"`.
- Objeto `schema` com `...auth`, `...sports`, `...evaluations`, `...health`, `...nutrition`.

**Checklist:**
- [x] Todos os domínios exportados e incluídos em `schema` para o cliente Drizzle.

---

### 7. Gerar e aplicar migrações

**Implementado:**
- Migração [0001_right_devos.sql](../src/db/migrations/0001_right_devos.sql) gerada com `bun run db:generate`.
- Migrações aplicadas com `bun run db:migrate` (sucesso).

**Checklist:**
- [x] SQL em snake_case; FKs e índices presentes.
- [x] Nenhuma referência circular entre domínios.
- [x] `db:migrate` executado com sucesso (requer `DATABASE_URL` e PostgreSQL ativo).

---

## Checklist geral para prevenir erros

Antes de alterar schemas ou criar novos:

1. **IDs:** Todas as tabelas novas devem ter `id: text("id").primaryKey().$defaultFn(() => randomUUIDV7())` com `randomUUIDV7` importado de `../../../lib/ids` (a partir de `db/schema/<domínio>/`).
2. **Imports:** Dentro de `apps/api/src` usar caminhos relativos; para `lib/ids` usar `../../../lib/ids` a partir de qualquer ficheiro em `db/schema/<domínio>/`.
3. **FKs:** Definir `onDelete: "cascade"` ou `"set null"` conforme o negócio; referenciar tabelas em `../auth` ou noutro domínio sem criar ciclos (evaluations → sports e auth; sports e health/nutrition só → auth).
4. **Índices:** Criar índices em colunas de FK e em campos usados em filtros (ex.: `status`, `member_id`).
5. **Convenção:** Manter `casing: 'snake_case'` no [drizzle.config.ts](../../drizzle.config.ts); não editar ficheiros em `db/migrations/` à mão.
6. **Após alterações:** Correr `bun run db:generate` (a partir da raiz do repo), rever o SQL gerado e depois `bun run db:migrate`.
7. **Relations:** Cada domínio deve ter `relations.ts` com Drizzle `relations()` para todas as tabelas que têm FKs; exportar no `index.ts` do domínio e garantir que o `schema` em `db/schema/index.ts` inclui o domínio.
