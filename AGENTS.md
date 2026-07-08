## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm (`pnpm …`)
- **Database**: Local PostgreSQL via `pg` + Drizzle ORM
- **Stack**: SvelteKit 3, Svelte 5 (runes, async, remote functions), DaisyUI, Lucide, Zod, UUID, Better Auth, Paraglide, Prettier, ESLint, Vitest, Playwright

---

## Documentation layers

| Layer              | Location                                              | Purpose                                                |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------ |
| **Rules**          | [`.cursor/rules/`](.cursor/rules/)                    | Short, enforced constraints (always-on or file-scoped) |
| **Skills**         | `~/.cursor/skills/employee-portal-*`                  | Deep reference cheat sheets (load on demand)           |
| **MCP**            | Svelte MCP via [`.cursor/mcp.json`](.cursor/mcp.json) | Live upstream SvelteKit/Svelte 5 docs                  |
| **Reference code** | `department` + `employee` vertical slice              | Copy-paste working implementation                      |

---

## Cursor rules (repo)

| Rule                                                           | Scope                                         |
| -------------------------------------------------------------- | --------------------------------------------- |
| [`project-stack.mdc`](.cursor/rules/project-stack.mdc)         | Always on — stack, pnpm scripts               |
| [`crud-workflow.mdc`](.cursor/rules/crud-workflow.mdc)         | Always on — layer order                       |
| [`daisyui-theme.mdc`](.cursor/rules/daisyui-theme.mdc)         | Always on — `winter` light, `night` dark      |
| [`auth-routes.mdc`](.cursor/rules/auth-routes.mdc)             | Always on — auth pages under `/auth/*`        |
| [`forms-layout.mdc`](.cursor/rules/forms-layout.mdc)           | `**/+page.svelte` — card + form-table layout  |
| [`modal-dialogs.mdc`](.cursor/rules/modal-dialogs.mdc)       | `**/*Dialog.svelte` — content-sized modals    |
| [`drizzle-schema.mdc`](.cursor/rules/drizzle-schema.mdc)       | `**/db/schema/**` — pgEnum, FK, relations     |
| [`remote-functions.mdc`](.cursor/rules/remote-functions.mdc)   | `**/*.remote.ts` — query/form/command         |
| [`api-routes.mdc`](.cursor/rules/api-routes.mdc)               | `**/+server.ts` — REST handlers               |
| [`svelte-pages.mdc`](.cursor/rules/svelte-pages.mdc)           | `**/*.svelte` — runes, boundaries, autofixer  |
| [`svelte-render.mdc`](.cursor/rules/svelte-render.mdc)         | `**/*.svelte` — `Snippet` + `{@render}` only  |
| [`action-buttons.mdc`](.cursor/rules/action-buttons.mdc)       | `**/*.svelte` — icon actions + `IconActionButton` |
| [`data-tables.mdc`](.cursor/rules/data-tables.mdc)           | List tables — `DataTable`, filters, sticky columns, pagination (default 20) |
| [`roles-permissions.mdc`](.cursor/rules/roles-permissions.mdc) | Roles, department scoping, invites, guards    |

---

## Personal skills (when to load)

| Skill                               | Load when                                              |
| ----------------------------------- | ------------------------------------------------------ |
| `employee-portal-workflow`          | Any new entity, feature, or CRUD work                  |
| `employee-portal-sveltekit-remotes` | `.remote.ts`, async pages, `{#await remote()}`         |
| `employee-portal-daisyui`           | Forms, tables, buttons, drawer, theme                  |
| `employee-portal-drizzle`           | Schema, services, migrations, queries                  |
| `employee-portal-zod`               | `src/lib/schemas/`, validation in services/remotes/API |
| `employee-portal-uuid`              | Primary keys, ID generation                            |
| `employee-portal-better-auth`       | Login, hooks, OAuth, session guards                    |
| `employee-portal-lucide`            | Icons in Svelte components                             |
| `employee-portal-eslint-prettier`   | Lint/format before commit                              |
| `employee-portal-pnpm`              | Package install, pnpm scripts                          |
| `employee-portal-playwright`        | E2E tests                                              |
| `employee-portal-paraglide`         | i18n / translated strings                              |

---

## CRUD checklist (per entity `{entity}`)

1. **Schema** — `src/lib/server/db/schema/{entity}.ts` (+ `enums.ts` if needed)
2. **Zod** — `src/lib/schemas/{entity}.ts`
3. **Service** — `src/lib/server/services/{entity}.ts` (FK joins on reads)
4. **Remote** — `src/lib/remotes/{entity}.remote.ts`
5. **API** — `src/routes/api/{entities}/+server.ts` + `[id]/+server.ts`
6. **Routes** — `(private)/{entities}/` pages with `{#await remote()}`
7. **UI** — DaisyUI card + `form-table` layout + Lucide icons; themes `winter` / `night` only
8. **Validate** — svelte-autofixer, `pnpm lint`, `pnpm check`

### Reference implementation

| Layer   | Files                                                           |
| ------- | --------------------------------------------------------------- |
| Schema  | `schema/enums.ts`, `schema/department.ts`, `schema/employee.ts` |
| Zod     | `schemas/department.ts`, `schemas/employee.ts`                  |
| Service | `services/department.ts`, `services/employee.ts`                |
| Remote  | `remotes/department.remote.ts`, `remotes/employee.remote.ts`    |
| API     | `routes/api/departments/`, `routes/api/employees/`              |
| Routes  | `(private)/departments/`, `(private)/employees/`                |

---

## Svelte MCP (live docs)

Use when writing Svelte/SvelteKit code:

1. **list-sections** — discover documentation topics
2. **get-documentation** — fetch sections (e.g. `kit/remote-functions`, `svelte/await-expressions`, `kit/routing`)
3. **svelte-autofixer** — validate every `.svelte` file before finishing
4. **playground-link** — only on user request, never for project files

Do **not** use Svelte MCP for DaisyUI, Zod, or Drizzle — use the personal skills above.
