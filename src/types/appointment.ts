export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export type AppointmentRow = {
  id: number;
  patientId: number;
  patientName: string;
  patientContact?: string;
  doctorName: string;
  startAt: string;
  endAt: string | null;
  status: AppointmentStatus;
  notes?: string;
};
