import {
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { accounts } from "../player/schema"
import type { NotificationKind } from "./prefs"

export const pushSubscriptions = pgTable("push_subscriptions", {
  endpoint: text("endpoint").primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const notificationDispatches = pgTable(
  "notification_dispatches",
  {
    gameDay: text("game_day").notNull(),
    kind: text("kind").$type<NotificationKind>().notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.gameDay, table.kind] })]
)

export const accountNotificationPrefs = pgTable("account_notification_prefs", {
  accountId: text("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  newPuzzle: boolean("new_puzzle").notNull().default(false),
  hurryUp: boolean("hurry_up").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
