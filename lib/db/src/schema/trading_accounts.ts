import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const tradingAccountsTable = pgTable("trading_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  exchange: text("exchange").notNull(),
  label: text("label").notNull(),
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  mode: text("mode").notNull().default("paper"), // paper | live
  status: text("status").notNull().default("active"), // active | inactive | error
  balance: numeric("balance", { precision: 20, scale: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTradingAccountSchema = createInsertSchema(tradingAccountsTable).omit({ id: true, createdAt: true });
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;
export type TradingAccount = typeof tradingAccountsTable.$inferSelect;
