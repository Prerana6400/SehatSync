import { Router } from "express";
import { z } from "zod";
import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  toPatientDTO,
  toPatientDetailDTO,
  toPatientListDTO,
} from "../lib/patient-mapper.js";
import { authenticate, requireRole, type AuthedRequest } from "../middleware/auth.js";

export const patientsRouter = Router();

const patientBody = z.object({
  name: z.string().min(1),
  age: z.number().int().min(1).max(150),
  contact: z.string().min(1),
  email: z.string().email(),
  address: z.string().default(""),
  gender: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v : "unspecified")),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalHistory: z.string().optional(),
  primaryCondition: z.string().optional(),
  assignedDoctor: z.string().optional(),
  followUpDue: z.string().optional(),
  lastVisit: z.string().optional(),
});

const patientUpdate = patientBody.partial();

const visitBody = z.object({
  visitDate: z.string().min(1),
  chiefComplaint: z.string().min(1),
  diagnosis: z.string().optional(),
  clinicalNotes: z.string().optional(),
  providerLabel: z.string().optional(),
});

const canWrite: Role[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTION"];

function parseLastVisit(s?: string): Date | null | undefined {
  if (s === undefined) return undefined;
  if (s === "" || s === null) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

patientsRouter.get("/", authenticate, async (req: AuthedRequest, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const idMatch = /^\d+$/.test(q) ? Number.parseInt(q, 10) : NaN;
  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { contact: { contains: q, mode: "insensitive" } },
            ...(!Number.isNaN(idMatch) ? [{ id: idMatch }] : []),
          ],
        }
      : undefined,
    orderBy: { id: "desc" },
    include: { _count: { select: { visits: true } } },
  });
  res.json(patients.map(toPatientListDTO));
});

patientsRouter.post("/", authenticate, requireRole(...canWrite), async (req, res) => {
  const parsed = patientBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  const lastVisit = parseLastVisit(data.lastVisit);
  const followUpDue = parseLastVisit(data.followUpDue);
  const patient = await prisma.patient.create({
    data: {
      name: data.name,
      age: data.age,
      contact: data.contact,
      email: data.email,
      address: data.address,
      gender: data.gender,
      bloodType: data.bloodType,
      allergies: data.allergies,
      emergencyContact: data.emergencyContact,
      medicalHistory: data.medicalHistory,
      primaryCondition: data.primaryCondition,
      assignedDoctor: data.assignedDoctor,
      followUpDue: followUpDue === undefined ? undefined : followUpDue,
      lastVisit: lastVisit === undefined ? new Date() : lastVisit,
    },
  });
  res.status(201).json(toPatientDTO(patient));
});

patientsRouter.post("/:id/visits", authenticate, requireRole(...canWrite), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = visitBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const vd = new Date(parsed.data.visitDate);
  if (Number.isNaN(vd.getTime())) {
    return res.status(400).json({ error: "Invalid visitDate" });
  }

  const visit = await prisma.clinicalVisit.create({
    data: {
      patientId: id,
      visitDate: vd,
      chiefComplaint: parsed.data.chiefComplaint,
      diagnosis: parsed.data.diagnosis,
      clinicalNotes: parsed.data.clinicalNotes,
      providerLabel: parsed.data.providerLabel,
    },
  });

  const newLast =
    !patient.lastVisit || vd > patient.lastVisit ? vd : patient.lastVisit;
  await prisma.patient.update({
    where: { id },
    data: { lastVisit: newLast },
  });

  res.status(201).json({
    id: visit.id,
    visitDate: visit.visitDate.toISOString().slice(0, 10),
    chiefComplaint: visit.chiefComplaint,
    diagnosis: visit.diagnosis ?? undefined,
    clinicalNotes: visit.clinicalNotes ?? undefined,
    providerLabel: visit.providerLabel ?? undefined,
  });
});

patientsRouter.get("/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { visits: { orderBy: { visitDate: "desc" } } },
  });
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(toPatientDetailDTO(patient));
});

patientsRouter.patch("/:id", authenticate, requireRole(...canWrite), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = patientUpdate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const data = parsed.data;

  const dataPayload: Prisma.PatientUpdateInput = {};
  if (data.name !== undefined) dataPayload.name = data.name;
  if (data.age !== undefined) dataPayload.age = data.age;
  if (data.contact !== undefined) dataPayload.contact = data.contact;
  if (data.email !== undefined) dataPayload.email = data.email;
  if (data.address !== undefined) dataPayload.address = data.address;
  if (data.gender !== undefined) dataPayload.gender = data.gender;
  if (data.bloodType !== undefined) dataPayload.bloodType = data.bloodType;
  if (data.allergies !== undefined) dataPayload.allergies = data.allergies;
  if (data.emergencyContact !== undefined) dataPayload.emergencyContact = data.emergencyContact;
  if (data.medicalHistory !== undefined) dataPayload.medicalHistory = data.medicalHistory;
  if (data.primaryCondition !== undefined) dataPayload.primaryCondition = data.primaryCondition;
  if (data.assignedDoctor !== undefined) dataPayload.assignedDoctor = data.assignedDoctor;
  if (data.followUpDue !== undefined) {
    const fu = parseLastVisit(data.followUpDue);
    if (fu !== undefined) dataPayload.followUpDue = fu;
  }
  if (data.lastVisit !== undefined) {
    const lv = parseLastVisit(data.lastVisit);
    if (lv !== undefined) dataPayload.lastVisit = lv;
  }

  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: dataPayload,
    });
    res.json(toPatientDTO(patient));
  } catch {
    res.status(404).json({ error: "Patient not found" });
  }
});

patientsRouter.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    await prisma.patient.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Patient not found" });
  }
});
