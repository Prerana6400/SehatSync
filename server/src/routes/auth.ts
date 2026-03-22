import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import type { Role } from "@prisma/client";
import { authenticate, type AuthedRequest } from "../middleware/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "RECEPTION"]).optional(),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

/** Bootstrap: register first user as ADMIN when database has zero users */
authRouter.post("/register", async (req, res) => {
  const count = await prisma.user.count();
  if (count > 0) {
    return res.status(403).json({ error: "Registration disabled after first user exists" });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const role = (parsed.data.role ?? "ADMIN") as Role;

  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

authRouter.get("/me", authenticate, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});
