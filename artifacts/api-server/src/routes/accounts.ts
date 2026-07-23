import { Router, type IRouter } from "express";
import { db, tradingAccountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ConnectAccountBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

function serializeAccount(a: any) {
  return {
    id: a.id,
    userId: a.userId,
    exchange: a.exchange,
    label: a.label,
    status: a.status,
    balance: a.balance != null ? parseFloat(a.balance) : null,
    createdAt: a.createdAt,
  };
}

router.get("/accounts", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;

  const accounts = await db.select().from(tradingAccountsTable).where(eq(tradingAccountsTable.userId, userId));
  res.json(accounts.map(serializeAccount));
});

router.post("/accounts", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;

  const parsed = ConnectAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { exchange, label, apiKey, apiSecret } = parsed.data;

  const [account] = await db.insert(tradingAccountsTable).values({
    userId,
    exchange,
    label,
    apiKey,
    apiSecret,
    status: "active",
    balance: "10000.00",
  }).returning();

  res.status(201).json(serializeAccount(account));
});

router.delete("/accounts/:id", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  await db.delete(tradingAccountsTable).where(
    and(eq(tradingAccountsTable.id, id), eq(tradingAccountsTable.userId, userId))
  );
  res.sendStatus(204);
});

export default router;
