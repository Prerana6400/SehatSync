import type { Patient } from "./patient";

export type AlertOverview = {
  overdueFollowUps: { patient: Patient; issue: string }[];
  upcomingAppointments: {
    id: number;
    patientName: string;
    doctorName: string;
    startAt: string;
    status: string;
  }[];
  needingCheckups: { patient: Patient; issue: string }[];
  incompleteProfiles: { patient: Patient; issue: string }[];
};
