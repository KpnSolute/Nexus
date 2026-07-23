import { Router, type IRouter } from "express";
import { db, watchlistTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToWatchlistBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

router.get("/watchlist", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;

  const items = await db.select().from(watchlistTable).where(eq(watchlistTable.userId, userId));
  res.json(items.map(i => ({
    id: i.id,
    userId: i.userId,
    symbol: i.symbol,
    addedAt: i.addedAt,
  })));
});

router.post("/watchlist", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;

  const parsed = AddToWatchlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { symbol } = parsed.data;

  // Check for duplicate
  const [existing] = await db.select().from(watchlistTable).where(
    and(eq(watchlistTable.userId, userId), eq(watchlistTable.symbol, symbol))
  );
  if (existing) {
    res.status(201).json({
      id: existing.id,
      userId: existing.userId,
      symbol: existing.symbol,
      addedAt: existing.addedAt,
    });
    return;
  }

  const [item] = await db.insert(watchlistTable).values({ userId, symbol }).returning();
  res.status(201).json({
    id: item.id,
    userId: item.userId,
    symbol: item.symbol,
    addedAt: item.addedAt,
  });
});

router.delete("/watchlist/:symbol", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;
  const symbol = Array.isArray(req.params.symbol) ? req.params.symbol[0] : req.params.symbol;

  await db.delete(watchlistTable).where(
    and(eq(watchlistTable.userId, userId), eq(watchlistTable.symbol, symbol))
  );
  res.sendStatus(204);
});

export default router;
