import "../src/load-env.js";
import bcrypt from "bcrypt";
import { AppointmentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@sehatsync.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.log("Seed skipped: admin user already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });

  const now = new Date();
  const msDay = 86400000;
  const followOverdue = new Date(now.getTime() - 10 * msDay);

  const john = await prisma.patient.create({
    data: {
      name: "John Smith",
      age: 45,
      contact: "+1 (555) 0123",
      email: "john.smith@email.com",
      address: "123 Main St, Springfield, IL 62701",
      gender: "male",
      bloodType: "A+",
      allergies: "Penicillin (rash)",
      emergencyContact: "Jane Smith — spouse — +1 (555) 0124",
      medicalHistory: "Hypertension (Stage 1), on lisinopril 10mg daily.",
      primaryCondition: "Essential hypertension",
      assignedDoctor: "Dr. Mehta",
      followUpDue: followOverdue,
    },
  });

  const sarah = await prisma.patient.create({
    data: {
      name: "Sarah Johnson",
      age: 32,
      contact: "+1 (555) 0456",
      email: "sarah.johnson@email.com",
      address: "456 Oak Ave, Chicago, IL 60601",
      gender: "female",
      bloodType: "O-",
      allergies: "None documented",
      emergencyContact: "Mike Johnson — spouse — +1 (555) 0457",
      medicalHistory: "Seasonal asthma; uses albuterol PRN.",
      primaryCondition: "Asthma, intermittent",
      assignedDoctor: "Dr. Kim",
      followUpDue: new Date(now.getTime() + 21 * msDay),
    },
  });
  const d = (daysAgo: number) => {
    const x = new Date(now);
    x.setDate(x.getDate() - daysAgo);
    return x;
  };

  await prisma.clinicalVisit.createMany({
    data: [
      {
        patientId: john.id,
        visitDate: d(45),
        chiefComplaint: "Blood pressure check — routine follow-up",
        diagnosis: "Essential hypertension, controlled",
        clinicalNotes: "BP 128/82. Continue current medication. Lifestyle counseling reinforced.",
        providerLabel: "Dr. Mehta — Family Medicine",
      },
      {
        patientId: john.id,
        visitDate: d(12),
        chiefComplaint: "Medication refill + mild headache",
        diagnosis: "Tension headache",
        clinicalNotes: "Advised hydration and sleep hygiene. Refill lisinopril 90 days.",
        providerLabel: "Dr. Mehta — Family Medicine",
      },
      {
        patientId: sarah.id,
        visitDate: d(7),
        chiefComplaint: "Wheezing after cold",
        diagnosis: "Asthma exacerbation, mild",
        clinicalNotes: "Peak flow improved after nebulizer in clinic. Continue inhaler as directed.",
        providerLabel: "Nurse Patel — Urgent Care",
      },
      {
        patientId: sarah.id,
        visitDate: d(180),
        chiefComplaint: "Annual wellness visit",
        diagnosis: "Healthy adult; vaccines reviewed",
        clinicalNotes: "Influenza vaccine given. Labs deferred to next visit.",
        providerLabel: "Dr. Kim — Internal Medicine",
      },
    ],
  });

  for (const pid of [john.id, sarah.id]) {
    const latest = await prisma.clinicalVisit.findFirst({
      where: { patientId: pid },
      orderBy: { visitDate: "desc" },
    });
    if (latest) {
      await prisma.patient.update({
        where: { id: pid },
        data: { lastVisit: latest.visitDate },
      });
    }
  }

  await prisma.appointment.createMany({
    data: [
      {
        patientId: john.id,
        doctorName: "Dr. Mehta",
        startAt: new Date(now.getTime() + 2 * msDay),
        status: AppointmentStatus.SCHEDULED,
      },
      {
        patientId: sarah.id,
        doctorName: "Dr. Kim",
        startAt: new Date(now.getTime() + 1 * msDay),
        endAt: new Date(now.getTime() + 1 * msDay + 30 * 60 * 1000),
        status: AppointmentStatus.CONFIRMED,
      },
    ],
  });

  console.log(`Seeded admin: ${email} (change password in production)`);
  console.log("Seeded sample patients, visits, and appointments.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
