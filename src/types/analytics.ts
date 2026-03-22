import type { Patient } from "./patient";

export type AnalyticsOverview = {
  patientVolume: number;
  revisitRate: number;
  pendingActions: number;
  pendingFollowUps: Patient[];
  incompleteProfiles: Patient[];
};
