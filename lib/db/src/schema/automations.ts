import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const automationsTable = pgTable("automations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  condition: text("condition").notNull(), // gte | lte
  triggerPrice: numeric("trigger_price", { precision: 20, scale: 8 }).notNull(),
  side: text("side").notNull(), // buy | sell
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  orderType: text("order_type").notNull().default("market"), // market | limit
  limitPrice: numeric("limit_price", { precision: 20, scale: 8 }),
  broker: text("broker").notNull().default("paper"), // paper | alpaca | coinbase | binance | kraken | bybit
  status: text("status").notNull().default("active"), // active | triggered | completed | failed | cancelled
  firedAt: timestamp("fired_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAutomationSchema = createInsertSchema(automationsTable).omit({
  id: true,
  createdAt: true,
  firedAt: true,
  status: true,
});
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Automation = typeof automationsTable.$inferSelect;
