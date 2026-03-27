import "./load-env.js";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { patientsRouter } from "./routes/patients.js";
import { analyticsRouter } from "./routes/analytics.js";
import { publicRouter } from "./routes/public.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { appointmentsRouter } from "./routes/appointments.js";
import { alertsRouter } from "./routes/alerts.js";
import { aboutRouter } from "./routes/about.js";
import { sendWhatsApp } from "./utils/sendWhatsapp.js";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) ?? true;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "sehatsync-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/about", aboutRouter);

app.post("/webhook/whatsapp", async (req, res) => {
  const message = req.body.Body?.trim();
  const from = req.body.From;

  const phone = from.replace("whatsapp:", "");

  console.log("Incoming:", message, "from", phone);

  if (message === "+1") {
    await prisma.appointmentRequest.create({
      data: {
        requesterContact: phone,
        message: "SCHEDULE request",

        // TEMP values (you MUST decide logic later)
        patientId: 1, 
        weekStart: new Date(),
        weekEnd: new Date(),
      },
    });

    await sendWhatsApp(
      phone,
      "📅 Appointment request received.\nOur admin will contact you shortly."
    );

  } else if (message === "+2") {
    await prisma.appointmentRequest.create({
      data: {
        requesterContact: phone,
        message: "RESCHEDULE request",

        patientId: 1,
        weekStart: new Date(),
        weekEnd: new Date(),
      },
    });

    await sendWhatsApp(
      phone,
      "🔄 Reschedule request received.\nOur admin will contact you shortly."
    );

  } else {
    await sendWhatsApp(
      phone,
      "❓ Invalid option.\n\nSend:\n+1 to schedule\n+2 to reschedule"
    );
  }

  res.send("OK");
});
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`SehatSync API listening on http://localhost:${PORT}`);
});

