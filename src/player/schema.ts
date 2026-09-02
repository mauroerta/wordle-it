import {
  boolean,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import type { TileMark } from "../guess/evaluate-guess"
import type { PlayStatus } from "../play/play"

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const plays = pgTable(
  "plays",
  {
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    gameDay: text("game_day").notNull(),
    puzzle: text("puzzle").notNull(),
    guesses: jsonb("guesses").$type<string[]>().notNull(),
    evaluations: jsonb("evaluations").$type<TileMark[][]>().notNull(),
    status: text("status").$type<PlayStatus>().notNull(),
    hardMode: boolean("hard_mode").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.gameDay] })]
)
