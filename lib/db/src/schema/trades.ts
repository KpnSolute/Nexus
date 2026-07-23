import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // buy | sell
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  price: numeric("price", { precision: 20, scale: 8 }).notNull(),
  total: numeric("total", { precision: 20, scale: 8 }),
  status: text("status").notNull().default("filled"), // pending | filled | cancelled
  mode: text("mode").notNull().default("paper"), // paper | real
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  filledAt: timestamp("filled_at", { withTimezone: true }),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, createdAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
