import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, type AuthedRequest } from "../middleware/auth.js";
import { toPatientDTO } from "../lib/patient-mapper.js";

export const analyticsRouter = Router();

analyticsRouter.get("/overview", authenticate, async (_req: AuthedRequest, res) => {
  const now = new Date();
  const msDay = 1000 * 60 * 60 * 24;
  const daysAgo = (d: number) => new Date(now.getTime() - d * msDay);

  const patients = await prisma.patient.findMany();

  const patientVolume = patients.length;

  const recentWindowDays = 90;
  const recentCutoff = daysAgo(recentWindowDays);
  const withRecentVisit = patients.filter(
    (p) => p.lastVisit && p.lastVisit >= recentCutoff
  );
  const revisitRate =
    patientVolume === 0
      ? 0
      : Math.round((withRecentVisit.length / patientVolume) * 100);

  const followUpCutoff = daysAgo(30);
  const pendingFollowUps = patients.filter(
    (p) => p.lastVisit && p.lastVisit < followUpCutoff
  );

  const incompleteProfiles = patients.filter(
    (p) => !p.bloodType || !p.emergencyContact
  );

  const pendingActions = pendingFollowUps.length + incompleteProfiles.length;

  res.json({
    patientVolume,
    revisitRate,
    pendingActions,
    pendingFollowUps: pendingFollowUps.slice(0, 10).map(toPatientDTO),
    incompleteProfiles: incompleteProfiles.slice(0, 10).map(toPatientDTO),
  });
});
