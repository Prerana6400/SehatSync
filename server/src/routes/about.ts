import { Router } from "express";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { StaffStatus } from "@prisma/client";
import { authenticate, requireRole } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const aboutRouter = Router();

function isDatabaseUnavailable(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes("Can't reach database") ||
      err.message.includes("Connection refused") ||
      err.message.includes("ECONNREFUSED")
    );
  }
  return false;
}

aboutRouter.get("/doctors", async (_req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { name: "asc" },
    });

    res.json(
      doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        availableDays: d.availableDays,
        description: d.description,
        yearsExperience: d.yearsExperience,
      })),
    );
  } catch (err) {
    if (isDatabaseUnavailable(err)) {
      return res.status(503).json({
        error: "Database unavailable",
        detail: "PostgreSQL is not reachable. Start your database and ensure DATABASE_URL is correct.",
      });
    }
    throw err;
  }
});

aboutRouter.get("/staff", async (_req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { name: "asc" },
    });

    res.json(
      staff.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        department: s.department,
        contactNumber: s.contactNumber,
        status: s.status,
      })),
    );
  } catch (err) {
    if (isDatabaseUnavailable(err)) {
      return res.status(503).json({
        error: "Database unavailable",
        detail: "PostgreSQL is not reachable. Start your database and ensure DATABASE_URL is correct.",
      });
    }
    throw err;
  }
});

const staffPatchBody = z.object({
  status: z.nativeEnum(StaffStatus),
});

const canAdmin: Role[] = ["ADMIN"];

const doctorCreateBody = z.object({
  name: z.string().min(1),
  specialization: z.string().min(1),
  availableDays: z.array(z.string().min(1)).min(1),
  description: z.string().min(1).optional().nullable(),
  yearsExperience: z.number().int().min(0).optional().nullable(),
});

const staffCreateBody = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  department: z.string().min(1),
  contactNumber: z.string().min(1),
  status: z.nativeEnum(StaffStatus),
});

aboutRouter.patch("/staff/:id", authenticate, requireRole(...canAdmin), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid staff id" });

  const parsed = staffPatchBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  try {
    const updated = await prisma.staff.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      role: updated.role,
      department: updated.department,
      contactNumber: updated.contactNumber,
      status: updated.status,
    });
  } catch (err) {
    if (isDatabaseUnavailable(err)) {
      return res.status(503).json({
        error: "Database unavailable",
        detail: "PostgreSQL is not reachable. Start your database and ensure DATABASE_URL is correct.",
      });
    }
    res.status(404).json({ error: "Staff member not found" });
  }
});

aboutRouter.post("/doctors", authenticate, requireRole(...canAdmin), async (req, res) => {
  const parsed = doctorCreateBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  try {
    const created = await prisma.doctor.create({
      data: {
        name: parsed.data.name,
        specialization: parsed.data.specialization,
        availableDays: parsed.data.availableDays,
        description: parsed.data.description ?? undefined,
        yearsExperience: parsed.data.yearsExperience ?? undefined,
      },
    });

    res.status(201).json({
      id: created.id,
      name: created.name,
      specialization: created.specialization,
      availableDays: created.availableDays,
      description: created.description,
      yearsExperience: created.yearsExperience,
    });
  } catch (err) {
    if (isDatabaseUnavailable(err)) {
      return res.status(503).json({
        error: "Database unavailable",
        detail: "PostgreSQL is not reachable. Start your database and ensure DATABASE_URL is correct.",
      });
    }
    throw err;
  }
});

aboutRouter.post("/staff", authenticate, requireRole(...canAdmin), async (req, res) => {
  const parsed = staffCreateBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  try {
    const created = await prisma.staff.create({
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
        department: parsed.data.department,
        contactNumber: parsed.data.contactNumber,
        status: parsed.data.status,
      },
    });

    res.status(201).json({
      id: created.id,
      name: created.name,
      role: created.role,
      department: created.department,
      contactNumber: created.contactNumber,
      status: created.status,
    });
  } catch (err) {
    if (isDatabaseUnavailable(err)) {
      return res.status(503).json({
        error: "Database unavailable",
        detail: "PostgreSQL is not reachable. Start your database and ensure DATABASE_URL is correct.",
      });
    }
    throw err;
  }
});

