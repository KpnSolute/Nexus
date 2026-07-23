import { Router, type IRouter } from "express";
import { db, tradesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateTradeBody } from "@workspace/api-zod";
import { getTicker } from "../lib/market-data";

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

function serializeTrade(t: any) {
  return {
    id: t.id,
    userId: t.userId,
    symbol: t.symbol,
    side: t.side,
    quantity: parseFloat(t.quantity),
    price: parseFloat(t.price),
    total: t.total != null ? parseFloat(t.total) : null,
    status: t.status,
    mode: t.mode,
    notes: t.notes ?? null,
    createdAt: t.createdAt,
    filledAt: t.filledAt ?? null,
  };
}

router.get("/trades", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;

  const trades = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId));
  res.json(trades.map(serializeTrade));
});

router.post("/trades", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;

  const parsed = CreateTradeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { symbol, side, quantity, price: userPrice, notes } = parsed.data;

  // Get user's trading mode
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  // Use provided price or fetch current
  let price = userPrice;
  if (!price) {
    const ticker = await getTicker(symbol);
    price = ticker?.price ?? 0;
  }

  const total = quantity * (price ?? 0);
  const now = new Date();

  const [trade] = await db.insert(tradesTable).values({
    userId,
    symbol,
    side,
    quantity: String(quantity),
    price: String(price ?? 0),
    total: String(total),
    status: "filled",
    mode: user.tradingMode,
    notes: notes ?? null,
    filledAt: now,
  }).returning();

  res.status(201).json(serializeTrade(trade));
});

router.get("/trades/:id", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [trade] = await db.select().from(tradesTable).where(
    and(eq(tradesTable.id, id), eq(tradesTable.userId, userId))
  );
  if (!trade) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }
  res.json(serializeTrade(trade));
});

export default router;
