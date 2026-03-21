export interface Patient {
  id: number;
  name: string;
  age: number;
  contact: string;
  email: string;
  address: string;
  gender: string;
  bloodType?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  lastVisit?: string;
}