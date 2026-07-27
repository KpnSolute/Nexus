/**
 * Automations CRUD routes.
 *
 * GET    /automations        → list user's automation rules
 * POST   /automations        → create a rule
 * DELETE /automations/:id    → cancel/delete a rule
 */
import { Router, type IRouter } from "express";
import { db, automationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

const VALID_CONDITIONS = ["gte", "lte"] as const;
const VALID_SIDES      = ["buy", "sell"] as const;
const VALID_ORDER_TYPES = ["market", "limit"] as const;
const VALID_BROKERS    = ["paper", "alpaca", "coinbase", "binance", "kraken", "bybit"] as const;

type CreateBody = {
  symbol:       string;
  condition:    "gte" | "lte";
  triggerPrice: number;
  side:         "buy" | "sell";
  quantity:     number;
  orderType:    "market" | "limit";
  limitPrice?:  number;
  broker:       "paper" | "alpaca" | "coinbase" | "binance" | "kraken" | "bybit";
};

function validateCreateBody(body: any): CreateBody | { error: string } {
  if (!body.symbol || typeof body.symbol !== "string" || body.symbol.trim() === "") {
    return { error: "symbol is required" };
  }
  if (!VALID_CONDITIONS.includes(body.condition)) {
    return { error: `condition must be one of: ${VALID_CONDITIONS.join(", ")}` };
  }
  if (!VALID_SIDES.includes(body.side)) {
    return { error: `side must be one of: ${VALID_SIDES.join(", ")}` };
  }

  const triggerPrice = parseFloat(body.triggerPrice);
  if (!isFinite(triggerPrice) || triggerPrice <= 0) {
    return { error: "triggerPrice must be a positive number" };
  }
  const quantity = parseFloat(body.quantity);
  if (!isFinite(quantity) || quantity <= 0) {
    return { error: "quantity must be a positive number" };
  }

  const orderType: "market" | "limit" = VALID_ORDER_TYPES.includes(body.orderType)
    ? body.orderType as "market" | "limit"
    : "market";

  if (orderType === "limit") {
    const lp = parseFloat(body.limitPrice);
    if (!isFinite(lp) || lp <= 0) {
      return { error: "limitPrice is required and must be positive when orderType is 'limit'" };
    }
  }

  const broker = VALID_BROKERS.includes(body.broker) ? body.broker as CreateBody["broker"] : "paper";

  return {
    symbol:       body.symbol.trim().toUpperCase(),
    condition:    body.condition as "gte" | "lte",
    triggerPrice,
    side:         body.side as "buy" | "sell",
    quantity,
    orderType,
    limitPrice:   orderType === "limit" ? parseFloat(body.limitPrice) : undefined,
    broker,
  };
}

function serializeAutomation(a: any) {
  return {
    id:           a.id,
    userId:       a.userId,
    symbol:       a.symbol,
    condition:    a.condition,
    triggerPrice: parseFloat(a.triggerPrice),
    side:         a.side,
    quantity:     parseFloat(a.quantity),
    orderType:    a.orderType,
    limitPrice:    a.limitPrice != null ? parseFloat(a.limitPrice) : null,
    broker:        a.broker,
    status:        a.status,
    failureReason: a.failureReason ?? null,
    firedAt:       a.firedAt ?? null,
    createdAt:     a.createdAt,
  };
}

// GET /automations
router.get("/automations", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const rules = await db
    .select()
    .from(automationsTable)
    .where(eq(automationsTable.userId, req.session.userId!));
  res.json(rules.map(serializeAutomation));
});

// POST /automations
router.post("/automations", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const validated = validateCreateBody(req.body);
  if ("error" in validated) {
    res.status(400).json({ error: validated.error });
    return;
  }
  const data = validated;
  const [rule] = await db
    .insert(automationsTable)
    .values({
      userId:       req.session.userId!,
      symbol:       data.symbol.toUpperCase(),
      condition:    data.condition,
      triggerPrice: String(data.triggerPrice),
      side:         data.side,
      quantity:     String(data.quantity),
      orderType:    data.orderType,
      limitPrice:   data.limitPrice ? String(data.limitPrice) : undefined,
      broker:       data.broker,
      status:       "active",
    })
    .returning();
  logger.info({ ruleId: rule.id, symbol: rule.symbol, condition: rule.condition, triggerPrice: rule.triggerPrice }, "Automation created");
  res.status(201).json(serializeAutomation(rule));
});

// DELETE /automations/:id
router.delete("/automations/:id", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const id = parseInt(req.params.id, 10);
  await db
    .delete(automationsTable)
    .where(and(eq(automationsTable.id, id), eq(automationsTable.userId, req.session.userId!)));
  res.sendStatus(204);
});

export default router;
