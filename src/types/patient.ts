export interface ClinicalVisit {
  id: number;
  visitDate: string;
  chiefComplaint: string;
  diagnosis?: string;
  clinicalNotes?: string;
  providerLabel?: string;
}

export interface Patient {
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
  visitCount?: number;
  visits?: ClinicalVisit[];
}

export type PatientDetail = Patient & {
  visits: ClinicalVisit[];
};
