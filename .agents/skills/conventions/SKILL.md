---
name: conventions
description: Binding TypeScript conventions for Parle under src/. Use when writing, changing, reviewing, or refactoring TypeScript in this repo. Deviate only with a reason recorded at the call site.
---

# Conventions

Decisions, not suggestions. They apply to `src/` source. Tests, fixtures, and
build tooling (`*.config.ts`) may relax them when that makes the
test clearer.

TanStack Start, Drizzle, WorkOS: check current docs. Do not trust training data.

Format follows `.oxfmtrc.json`. Shape of the code follows
this skill. Prefer shadcn components (`src/components/ui/`, added via
`pnpm dlx shadcn@latest add`) for product UI — dialogs, forms, buttons,
sheets, alerts, and the like. Search the registry before inventing markup.
On review of new work, replace hand-rolled UI with an existing shadcn
component when one fits. The board and other live-parity game chrome stay
custom Parle UI (`parle.css` / game tokens), not shadcn semantic colors.

## Before you write

Solve the actual problem, simply. No abstraction, extra layer, or generality
ahead of a concrete need.

Make the change easy, then make the easy change. Prefer deleting to adding.
Leave each file you touch cleaner than you found it. Keep that fix small
enough to need no review of its own.

Match the live Parle look. Do not invent a new visual language for the board.

UI copy is Italian. Identifiers, file names, and comments in `src/` are
English. Settings show Accedi / Esci; code does not. A heading can say
Oggi; the type is `TodayRow`, never `OggiRow`.

## Shape of the code

Pass an options object at two or more parameters. One param stays positional.

Export factories, not classes. `createX(...)` returns an interface from the
owning module. Callers depend on the type, not the construction.

Put each type, function, error, schema, and test in the module that owns the
concept it operates on. Name modules for that concept (`group/`, `player/`,
`play/`). Never `src/shared/`, `src/common/`, `src/utils/`, or `src/domain/`.
A type two modules need belongs to a third named concept they both depend on.
Keep the module graph a DAG.

Things that change together stay close (Common Closure: gather what changes
for the same reason; Martin, _Clean Architecture_, ch. 13). The module is
that gathering. When the module folder accretes, split **inside it** so
related files are not a flat pile:

```
src/<module>/
  schema.ts
  components/
  queries/
  mutations/
  hooks/
  <name-that-fits>/
```

Create only folders that have files. `schema.ts` stays at the module root.
`components/ui` is the shadcn exception, generated, not a Parle module.
Do not invent a catch-all `utils/` — name the folder for the work
(`ranking/`, `invite.ts`). Tests sit next to the file they exercise.

Export only what another file imports. Put exported entry points at the top of
the file and private helpers below.

## Types, errors, control flow

Use `import type` for type-only imports. Follow the Start scaffold for
import suffixes (no `.ts` on app imports).

Never `any`. Use `unknown` plus narrowing, or a precise type.

Throw errors. Do not return error tuples.

Guard clauses over `else`. Reject the failure first, then let the happy path
fall through unindented.

## Promises

Each promise is `await`ed, `return`ed, or deliberately discarded with `void`.
An unmarked floating promise is banned. Run independent async work with
`Promise.all`.

## Comments

Default to none. Keep only a comment that explains a why the code cannot
express. One line, immediately above the code it defends.

## Tests

Place a test in the module that owns the concept it exercises
(`foo.ts` → `foo.test.ts`). Hermetic: no network, no Postgres server, no
WorkOS. Code that takes a `Db` is tested through its factory (`createGroups`)
on `createTestDb()` from `src/db/test-db.ts`: PGlite in-process with the real
migrations. Share one per file, `truncateAll` between tests.
