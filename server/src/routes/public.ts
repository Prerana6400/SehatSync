import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const publicRouter = Router();

/** Anonymous-safe aggregate stats for marketing / home page */
publicRouter.get("/summary", async (_req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [patientCount, visitCount, visitsThisMonth] = await Promise.all([
    prisma.patient.count(),
    prisma.clinicalVisit.count(),
    prisma.clinicalVisit.count({
      where: { visitDate: { gte: startOfMonth } },
    }),
  ]);

  res.json({
    patientCount,
    visitCount,
    visitsThisMonth,
  });
});
