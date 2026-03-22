import { Router } from "express";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authenticate, type AuthedRequest } from "../middleware/auth.js";
import { toPatientDTO } from "../lib/patient-mapper.js";

export const alertsRouter = Router();

alertsRouter.get("/overview", authenticate, async (_req: AuthedRequest, res) => {
  const now = new Date();
  const msDay = 86400000;
  const nextDays = new Date(now.getTime() + 3 * msDay);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * msDay);

  const patients = await prisma.patient.findMany();

  const overdueFollowUps = patients.filter(
    (p) => p.followUpDue && p.followUpDue < now
  );

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      startAt: { gte: now, lte: nextDays },
    },
    include: { patient: { select: { name: true } } },
    orderBy: { startAt: "asc" },
    take: 20,
  });

  const needingCheckups = patients.filter(
    (p) => !p.lastVisit || p.lastVisit < ninetyDaysAgo
  );

  const incompleteProfiles = patients.filter(
    (p) => !p.bloodType || !p.emergencyContact || !p.primaryCondition
  );

  res.json({
    overdueFollowUps: overdueFollowUps.slice(0, 20).map((p) => ({
      patient: toPatientDTO(p),
      issue: "Follow-up date passed or overdue review",
    })),
    upcomingAppointments: upcomingAppointments.map((a) => ({
      id: a.id,
      patientName: a.patient.name,
      doctorName: a.doctorName,
      startAt: a.startAt.toISOString(),
      status: a.status,
    })),
    needingCheckups: needingCheckups.slice(0, 20).map((p) => ({
      patient: toPatientDTO(p),
      issue: "No visit in the last 90 days",
    })),
    incompleteProfiles: incompleteProfiles.slice(0, 20).map((p) => ({
      patient: toPatientDTO(p),
      issue: "Missing blood type, emergency contact, or primary condition",
    })),
  });
});
