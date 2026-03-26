import { Router } from "express";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authenticate, type AuthedRequest } from "../middleware/auth.js";

function isDatabaseUnavailable(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1017"].includes(err.code);
  }
  if (err instanceof Error) {
    return (
      err.message.includes("Can't reach database") ||
      err.message.includes("Connection refused") ||
      err.message.includes("ECONNREFUSED")
    );
  }
  return false;
}

export const dashboardRouter = Router();

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

dashboardRouter.get("/overview", authenticate, async (_req: AuthedRequest, res, next) => {
  const now = new Date();
  const msDay = 86400000;
  const weekStart = startOfWeek(now);
  const sevenDaysAgo = new Date(now.getTime() - 6 * msDay);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * msDay);
  const nextWeek = new Date(now.getTime() + 7 * msDay);

  try {
  const patients = await prisma.patient.findMany();

  const totalPatients = patients.length;

  const newPatientsThisWeek = await prisma.patient.count({
    where: { createdAt: { gte: weekStart } },
  });

  const pendingFollowUps = patients.filter((p) => {
    if (p.followUpDue && p.followUpDue < now) return true;
    if (p.lastVisit && p.lastVisit < thirtyDaysAgo) return true;
    return false;
  });

  const incompleteProfiles = patients.filter(
    (p) => !p.bloodType || !p.emergencyContact || !p.primaryCondition
  );

  const dailyVisits: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * msDay);
    const s = startOfDay(day);
    const e = endOfDay(day);
    const count = await prisma.clinicalVisit.count({
      where: { visitDate: { gte: s, lte: e } },
    });
    dailyVisits.push({
      date: s.toISOString().slice(0, 10),
      count,
    });
  }

  const weeklyVisits: { date: string; count: number }[] = [];
  const msWeek = 7 * msDay;
  for (let i = 3; i >= 0; i--) {
    const rawWeekStart = new Date(now.getTime() - i * msWeek);
    const weekStart = startOfWeek(rawWeekStart);
    const weekEnd = new Date(weekStart.getTime() + msWeek - 1);

    const count = await prisma.clinicalVisit.count({
      where: { visitDate: { gte: weekStart, lte: weekEnd } },
    });
    weeklyVisits.push({
      date: weekStart.toISOString().slice(0, 10),
      count,
    });
  }

  const followUpsScheduled = await prisma.appointment.count({
    where: {
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      startAt: { gte: now, lte: nextWeek },
    },
  });

  const recentlyAdded = await prisma.patient.findMany({
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  const recentForUi = recentlyAdded.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    medicalCondition: p.primaryCondition || p.medicalHistory?.slice(0, 80) || "—",
    lastVisit: p.lastVisit ? p.lastVisit.toISOString().slice(0, 10) : null,
  }));

  res.json({
    stats: {
      totalPatients,
      newPatientsThisWeek,
      pendingFollowUps: pendingFollowUps.length,
      incompleteProfiles: incompleteProfiles.length,
    },
    activity: {
      weeklyVisitsLast4Weeks: weeklyVisits,
      dailyVisitsLast7Days: dailyVisits,
      followUpsScheduledNext7Days: followUpsScheduled,
    },
    recentPatients: recentForUi,
  });
  } catch (err) {
    console.error("[dashboard/overview]", err);
    if (isDatabaseUnavailable(err)) {
      return res.status(503).json({
        error: "Database unavailable",
        detail:
          "PostgreSQL is not reachable. Start your database (e.g. local PostgreSQL on port 5432), then run npm run db:push from the repo root. Check DATABASE_URL in .env.",
      });
    }
    next(err);
  }
});
