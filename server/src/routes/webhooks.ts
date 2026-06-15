import { Webhook } from "svix";
import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/clerk", async (req: Request, res: Response) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
  const wh = new Webhook(webhookSecret);

  let evt: {
    type: string;
    data: { id: string; email_addresses: { email_address: string }[] };
  };

  try {
    evt = wh.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    }) as typeof evt;
  } catch {
    res.status(400).json({ error: "Invalid webhook" });
    return;
  }

  if (evt.type === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    await prisma.user.upsert({
      where: { id },
      update: {},
      create: { id, email },
    });
  }

  res.json({ received: true });
});

export default router;
