import { Router, type IRouter } from "express";
import { db, tradingAccountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ConnectAccountBody } from "@workspace/api-zod";
import { validateAlpacaKeys } from "../lib/alpaca";
import { validateCoinbaseKeys } from "../lib/coinbase";
import { validateBinanceKeys } from "../lib/binance";
import { validateKrakenPrivateKeys } from "../lib/kraken-private";
import { validateBybitKeys } from "../lib/bybit";
import { logger } from "../lib/logger";

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
    id:        a.id,
    userId:    a.userId,
    exchange:  a.exchange,
    label:     a.label,
    mode:      a.mode ?? "paper",
    status:    a.status,
    balance:   a.balance != null ? parseFloat(a.balance) : null,
    createdAt: a.createdAt,
  };
}

router.get("/accounts", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;
  const accounts = await db
    .select()
    .from(tradingAccountsTable)
    .where(eq(tradingAccountsTable.userId, userId));
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
  const mode = (req.body.mode === "live" ? "live" : "paper") as "paper" | "live";

  let balance: string | null = null;
  let status = "active";

  try {
    switch (exchange) {
      case "alpaca": {
        const acct = await validateAlpacaKeys(apiKey, apiSecret, mode);
        balance = parseFloat(acct.equity).toFixed(2);
        break;
      }
      case "coinbase": {
        const acct = await validateCoinbaseKeys(apiKey, apiSecret, mode);
        balance = acct.portfolioValue.toFixed(2);
        break;
      }
      case "binance": {
        const acct = await validateBinanceKeys(apiKey, apiSecret, mode);
        balance = acct.cash.toFixed(2);
        break;
      }
      case "kraken": {
        const acct = await validateKrakenPrivateKeys(apiKey, apiSecret, mode);
        balance = acct.cash.toFixed(2);
        break;
      }
      case "bybit": {
        const acct = await validateBybitKeys(apiKey, apiSecret, mode);
        balance = acct.equity.toFixed(2);
        break;
      }
      default:
        // Unknown exchange — store but don't validate
        logger.warn({ exchange }, "Unknown exchange type, storing without validation");
    }
  } catch (err: any) {
    logger.warn({ err, exchange }, "Broker key validation failed");
    res.status(400).json({ error: `Invalid ${exchange} credentials: ${err?.message ?? "check your API key and secret"}` });
    return;
  }

  const [account] = await db
    .insert(tradingAccountsTable)
    .values({ userId, exchange, label, apiKey, apiSecret, mode, status, balance })
    .returning();

  res.status(201).json(serializeAccount(account));
});

router.delete("/accounts/:id", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db
    .delete(tradingAccountsTable)
    .where(and(eq(tradingAccountsTable.id, id), eq(tradingAccountsTable.userId, userId)));
  res.sendStatus(204);
});

export default router;
