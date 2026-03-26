import "../src/load-env.js";
import bcrypt from "bcrypt";
import { AppointmentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@sehatsync.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.log("Admin user already exists. Skipping admin creation.");
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin user: ${email} (change password in production)`);
  }

  const now = new Date();
  const msDay = 86400000;
  const followOverdue = new Date(now.getTime() - 10 * msDay);

  const doctorCount = await prisma.doctor.count();
  if (doctorCount === 0) {
    await prisma.doctor.createMany({
      data: [
        {
          name: "Dr. Mehta",
          specialization: "General Physician",
          availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          description: "Primary care and follow-up planning.",
          yearsExperience: 10,
        },
        {
          name: "Dr. Kim",
          specialization: "Internal Medicine",
          availableDays: ["Mon", "Wed", "Fri"],
          description: "Chronic disease management and internal consults.",
          yearsExperience: 8,
        },
        {
          name: "Dr. Rahman",
          specialization: "Pediatrician",
          availableDays: ["Tue", "Thu"],
          description: "Child wellness and vaccination reviews.",
          yearsExperience: 6,
        },
      ],
    });
  }

  const staffCount = await prisma.staff.count();
  if (staffCount === 0) {
    await prisma.staff.createMany({
      data: [
        {
          name: "Anya Shah",
          role: "Receptionist",
          department: "Front Desk",
          contactNumber: "+1 (555) 0100",
          status: "ACTIVE",
        },
        {
          name: "Nurse Patel",
          role: "Nurse",
          department: "OPD Nursing",
          contactNumber: "+1 (555) 0101",
          status: "ACTIVE",
        },
        {
          name: "William Grant",
          role: "Admin",
          department: "Administration",
          contactNumber: "+1 (555) 0102",
          status: "ON_LEAVE",
        },
      ],
    });
  }

  const patientCount = await prisma.patient.count();
  const targetPatientCount = Math.max(patientCount, 8);

  const createBasePatientPair = async () => {
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

    return { johnId: john.id, sarahId: sarah.id };
  };

  if (patientCount === 0) {
    await createBasePatientPair();
  }

  const patientCountAfterBase = await prisma.patient.count();
  const remainingPatientsToCreate = Math.max(0, targetPatientCount - patientCountAfterBase);

  const extraPatientsTemplates = [
    {
      name: "Michael Turner",
      age: 39,
      contact: "+1 (555) 0211",
      email: "michael.turner@email.com",
      address: "78 Lakeview Rd, Austin, TX 73301",
      gender: "male",
      bloodType: "B+",
      allergies: "None documented",
      emergencyContact: "Sara Turner — +1 (555) 0212",
      medicalHistory: "Type 2 diabetes; monitoring HbA1c.",
      primaryCondition: "Type 2 diabetes",
      assignedDoctor: "Dr. Mehta",
      followUpDue: followOverdue,
    },
    {
      name: "Emily Clark",
      age: 26,
      contact: "+1 (555) 0222",
      email: "emily.clark@email.com",
      address: "220 Pine St, Denver, CO 80202",
      gender: "female",
      bloodType: "AB+",
      allergies: "Latex sensitivity",
      emergencyContact: "James Clark — +1 (555) 0223",
      medicalHistory: "Seasonal allergies; antihistamines as needed.",
      primaryCondition: "Seasonal allergic rhinitis",
      assignedDoctor: "Dr. Rahman",
      followUpDue: new Date(now.getTime() + 10 * msDay),
    },
    {
      name: "Daniel Wright",
      age: 51,
      contact: "+1 (555) 0233",
      email: "daniel.wright@email.com",
      address: "19 River Park Ave, Boston, MA 02108",
      gender: "male",
      bloodType: "O+",
      allergies: "Penicillin (rash)",
      emergencyContact: "Laura Wright — +1 (555) 0234",
      medicalHistory: "Hyperlipidemia; lifestyle counseling.",
      primaryCondition: "Hyperlipidemia",
      assignedDoctor: "Dr. Kim",
      followUpDue: new Date(now.getTime() + 21 * msDay),
    },
    {
      name: "Sophia Baker",
      age: 34,
      contact: "+1 (555) 0244",
      email: "sophia.baker@email.com",
      address: "500 Market St, San Francisco, CA 94105",
      gender: "female",
      bloodType: "A-",
      allergies: "None documented",
      emergencyContact: "Noah Baker — +1 (555) 0245",
      medicalHistory: "GERD symptoms; managed with dietary changes.",
      primaryCondition: "Gastroesophageal reflux",
      assignedDoctor: "Dr. Mehta",
      followUpDue: followOverdue,
    },
    {
      name: "Oliver James",
      age: 29,
      contact: "+1 (555) 0255",
      email: "oliver.james@email.com",
      address: "11 Meadow Lane, Seattle, WA 98101",
      gender: "male",
      bloodType: "B-",
      allergies: "None documented",
      emergencyContact: "Mia James — +1 (555) 0256",
      medicalHistory: "Intermittent asthma symptoms.",
      primaryCondition: "Asthma, intermittent",
      assignedDoctor: "Dr. Rahman",
      followUpDue: new Date(now.getTime() + 7 * msDay),
    },
    {
      name: "Grace Wilson",
      age: 47,
      contact: "+1 (555) 0266",
      email: "grace.wilson@email.com",
      address: "88 Sunset Blvd, Miami, FL 33101",
      gender: "female",
      bloodType: "O-",
      allergies: "Sulfa allergy",
      emergencyContact: "Henry Wilson — +1 (555) 0267",
      medicalHistory: "Hypertension; medication follow-up.",
      primaryCondition: "Essential hypertension",
      assignedDoctor: "Dr. Kim",
      followUpDue: new Date(now.getTime() + 18 * msDay),
    },
  ];

  if (remainingPatientsToCreate > 0) {
    const templatesToUse = extraPatientsTemplates.slice(0, remainingPatientsToCreate);
    for (const t of templatesToUse) {
      await prisma.patient.create({
        data: {
          name: t.name,
          age: t.age,
          contact: t.contact,
          email: t.email,
          address: t.address,
          gender: t.gender,
          bloodType: t.bloodType,
          allergies: t.allergies,
          emergencyContact: t.emergencyContact,
          medicalHistory: t.medicalHistory,
          primaryCondition: t.primaryCondition,
          assignedDoctor: t.assignedDoctor,
          followUpDue: t.followUpDue,
        },
      });
    }
  }

  const last7Start = new Date(now.getTime() - 6 * msDay);
  const visitsLast7 = await prisma.clinicalVisit.count({
    where: { visitDate: { gte: last7Start } },
  });

  const patientsForVisits = await prisma.patient.findMany({
    take: 20,
    orderBy: { id: "desc" },
  });
  const doctorsForLabels = await prisma.doctor.findMany({
    take: 5,
    orderBy: { id: "desc" },
  });

  const providerLabels =
    doctorsForLabels.length > 0
      ? doctorsForLabels.map((d) => `${d.name} — ${d.specialization}`)
      : ["Clinic"];

  if (visitsLast7 < 7) {
    const visitData: Array<{
      patientId: number;
      visitDate: Date;
      chiefComplaint: string;
      diagnosis?: string;
      clinicalNotes?: string;
      providerLabel?: string;
    }> = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const patient = patientsForVisits[dayOffset % Math.max(1, patientsForVisits.length)];
      if (!patient) break;
      const providerLabel = providerLabels[dayOffset % providerLabels.length];

      visitData.push({
        patientId: patient.id,
        visitDate: new Date(now.getTime() - dayOffset * msDay + 2 * 60 * 60 * 1000),
        chiefComplaint: dayOffset % 2 === 0 ? "Routine follow-up visit" : "Medication review and assessment",
        diagnosis: dayOffset % 2 === 0 ? "Follow-up ongoing care" : "No acute findings",
        clinicalNotes: "Vitals stable. Continue current plan. Lifestyle counseling provided.",
        providerLabel,
      });
    }

    if (visitData.length > 0) {
      await prisma.clinicalVisit.createMany({ data: visitData });
    }
  }

  const recentVisits = await prisma.clinicalVisit.findMany({
    where: { visitDate: { gte: last7Start } },
    orderBy: { visitDate: "desc" },
    take: 20,
  });

  const recentPatientIds = [...new Set(recentVisits.map((v) => v.patientId))];
  for (const pid of recentPatientIds) {
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

  const nextWeekEnd = new Date(now.getTime() + 7 * msDay);
  const upcomingCount = await prisma.appointment.count({
    where: {
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      startAt: { gte: now, lte: nextWeekEnd },
    },
  });

  const patientsForAppointments = await prisma.patient.findMany({
    take: 10,
    orderBy: { id: "desc" },
  });
  const doctorNames = doctorsForLabels.map((d) => d.name);

  if (upcomingCount < 4 && patientsForAppointments.length > 0 && doctorNames.length > 0) {
    const needed = Math.min(4 - upcomingCount, Math.max(0, patientsForAppointments.length));
    const appointmentData: Array<{
      patientId: number;
      doctorName: string;
      startAt: Date;
      endAt?: Date;
      status: AppointmentStatus;
    }> = [];

    for (let i = 1; i <= needed; i++) {
      const patient = patientsForAppointments[i % patientsForAppointments.length];
      const doctorName = doctorNames[i % doctorNames.length];
      const startAt = new Date(now.getTime() + i * msDay + 3 * 60 * 60 * 1000);
      const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

      appointmentData.push({
        patientId: patient.id,
        doctorName,
        startAt,
        endAt,
        status: i % 2 === 0 ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED,
      });
    }

    if (appointmentData.length > 0) {
      await prisma.appointment.createMany({ data: appointmentData });
    }
  }

  console.log("Seed complete: doctors, staff, and sample patients/visits/appointments (ensured for dashboards).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
