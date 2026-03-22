import { Router } from "express";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole, type AuthedRequest } from "../middleware/auth.js";

export const appointmentsRouter = Router();

const canWrite: Role[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTION"];

const createBody = z.object({
  patientId: z.number().int(),
  doctorName: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

const patchBody = z.object({
  doctorName: z.string().min(1).optional(),
  startAt: z.string().optional(),
  endAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

appointmentsRouter.get("/", authenticate, async (req: AuthedRequest, res) => {
  const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(from && to ? { startAt: { gte: from, lte: to } } : {}),
    },
    include: {
      patient: { select: { id: true, name: true, contact: true } },
    },
    orderBy: { startAt: "asc" },
  });

  res.json(
    appointments.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      patientName: a.patient.name,
      patientContact: a.patient.contact,
      doctorName: a.doctorName,
      startAt: a.startAt.toISOString(),
      endAt: a.endAt?.toISOString() ?? null,
      status: a.status,
      notes: a.notes ?? undefined,
    }))
  );
});

appointmentsRouter.post("/", authenticate, requireRole(...canWrite), async (req, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const d = parsed.data;
  const startAt = new Date(d.startAt);
  const endAt = d.endAt ? new Date(d.endAt) : null;
  if (Number.isNaN(startAt.getTime())) {
    return res.status(400).json({ error: "Invalid startAt" });
  }

  const patient = await prisma.patient.findUnique({ where: { id: d.patientId } });
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const appt = await prisma.appointment.create({
    data: {
      patientId: d.patientId,
      doctorName: d.doctorName,
      startAt,
      endAt,
      notes: d.notes,
      status: d.status ?? AppointmentStatus.SCHEDULED,
    },
    include: { patient: { select: { name: true, contact: true } } },
  });

  res.status(201).json({
    id: appt.id,
    patientId: appt.patientId,
    patientName: appt.patient.name,
    patientContact: appt.patient.contact,
    doctorName: appt.doctorName,
    startAt: appt.startAt.toISOString(),
    endAt: appt.endAt?.toISOString() ?? null,
    status: appt.status,
    notes: appt.notes ?? undefined,
  });
});

appointmentsRouter.patch("/:id", authenticate, requireRole(...canWrite), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = patchBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const d = parsed.data;
  try {
    const appt = await prisma.appointment.update({
      where: { id },
      data: {
        ...(d.doctorName !== undefined && { doctorName: d.doctorName }),
        ...(d.startAt !== undefined && { startAt: new Date(d.startAt) }),
        ...(d.endAt !== undefined && { endAt: d.endAt ? new Date(d.endAt) : null }),
        ...(d.notes !== undefined && { notes: d.notes }),
        ...(d.status !== undefined && { status: d.status }),
      },
      include: { patient: { select: { name: true, contact: true } } },
    });
    res.json({
      id: appt.id,
      patientId: appt.patientId,
      patientName: appt.patient.name,
      patientContact: appt.patient.contact,
      doctorName: appt.doctorName,
      startAt: appt.startAt.toISOString(),
      endAt: appt.endAt?.toISOString() ?? null,
      status: appt.status,
      notes: appt.notes ?? undefined,
    });
  } catch {
    res.status(404).json({ error: "Appointment not found" });
  }
});

appointmentsRouter.delete("/:id", authenticate, requireRole(...canWrite), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    await prisma.appointment.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Appointment not found" });
  }
});
