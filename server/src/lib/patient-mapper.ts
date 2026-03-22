import type { ClinicalVisit, Patient } from "@prisma/client";

export type ClinicalVisitDTO = {
  id: number;
  visitDate: string;
  chiefComplaint: string;
  diagnosis?: string;
  clinicalNotes?: string;
  providerLabel?: string;
};

export type PatientDTO = {
  id: number;
  name: string;
  age: number;
  contact: string;
  email: string;
  address: string;
  gender: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  primaryCondition?: string;
  assignedDoctor?: string;
  followUpDue?: string;
  lastVisit?: string;
};

export type PatientListDTO = PatientDTO & {
  visitCount: number;
};

export type PatientDetailDTO = PatientDTO & {
  visits: ClinicalVisitDTO[];
};

export function toPatientDTO(p: Patient): PatientDTO {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    contact: p.contact,
    email: p.email,
    address: p.address,
    gender: p.gender,
    bloodType: p.bloodType ?? undefined,
    allergies: p.allergies ?? undefined,
    emergencyContact: p.emergencyContact ?? undefined,
    medicalHistory: p.medicalHistory ?? undefined,
    primaryCondition: p.primaryCondition ?? undefined,
    assignedDoctor: p.assignedDoctor ?? undefined,
    followUpDue: p.followUpDue ? p.followUpDue.toISOString().slice(0, 10) : undefined,
    lastVisit: p.lastVisit ? p.lastVisit.toISOString().slice(0, 10) : undefined,
  };
}

export function toVisitDTO(v: ClinicalVisit): ClinicalVisitDTO {
  return {
    id: v.id,
    visitDate: v.visitDate.toISOString().slice(0, 10),
    chiefComplaint: v.chiefComplaint,
    diagnosis: v.diagnosis ?? undefined,
    clinicalNotes: v.clinicalNotes ?? undefined,
    providerLabel: v.providerLabel ?? undefined,
  };
}

export function toPatientListDTO(
  p: Patient & { _count: { visits: number } }
): PatientListDTO {
  return {
    ...toPatientDTO(p),
    visitCount: p._count.visits,
  };
}

export function toPatientDetailDTO(
  p: Patient & { visits: ClinicalVisit[] }
): PatientDetailDTO {
  const visits = [...p.visits].sort(
    (a, b) => b.visitDate.getTime() - a.visitDate.getTime()
  );
  return {
    ...toPatientDTO(p),
    visits: visits.map(toVisitDTO),
  };
}
