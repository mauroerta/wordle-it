---
name: conventions
description: Binding TypeScript conventions for Parle under src/. Use when writing, changing, reviewing, or refactoring TypeScript in this repo. Deviate only with a reason recorded at the call site.
---

# Conventions

Decisions, not suggestions. They apply to `src/` source. Tests, fixtures, and
build tooling (`scripts/`, `*.config.ts`) may relax them when that makes the
test clearer.

TanStack Start, Drizzle, WorkOS: check current docs. Do not trust training data.

Format follows `.oxfmtrc.json`. Shape of the code follows
this skill. `src/lib/utils.ts` is the shadcn `cn` helper, not a dumping
ground. `src/components/ui/` is generated shadcn. Parle board colors are
the live CSS variables, not shadcn semantic tokens.

## Before you write

Solve the actual problem, simply. No abstraction, extra layer, or generality
ahead of a concrete need.

Make the change easy, then make the easy change. Prefer deleting to adding.
Leave each file you touch cleaner than you found it. Keep that fix small
enough to need no review of its own.

Match the live Parle look. Do not invent a new visual language for the board.

UI copy is Italian. Identifiers, file names, and comments in `src/` are
English. Settings show Accedi / Esci; code does not.

## Shape of the code

Pass an options object at two or more parameters. One param stays positional.

Export factories, not classes. `createX(...)` returns an interface from the
owning module. Callers depend on the type, not the construction.

Put each type, function, error, schema, and test in the module that owns the
concept it operates on. Name modules for that concept. Never `shared/`,
`common/`, `utils/`, or `domain/`. A type two modules need belongs to a third
named concept they both depend on. Keep the module graph a DAG.

Group by that same concept when a folder accretes. Split into subfolders named
for concepts, not layers (`services/`, `helpers/`, `models/`, `components/ui`
is the shadcn exception).

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
(`foo.ts` → `foo.test.ts`). Hermetic: no network, no Postgres, no WorkOS.
