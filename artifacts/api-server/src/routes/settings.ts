import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateTradingModeBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

router.patch("/settings/trading-mode", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const userId = req.session.userId!;

  const parsed = UpdateTradingModeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ tradingMode: parsed.data.mode })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    tradingMode: user.tradingMode,
    createdAt: user.createdAt,
  });
});

export default router;
