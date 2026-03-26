export type DashboardOverview = {
  stats: {
    totalPatients: number;
    newPatientsThisWeek: number;
    pendingFollowUps: number;
    incompleteProfiles: number;
  };
  activity: {
    weeklyVisitsLast4Weeks: { date: string; count: number }[];
    dailyVisitsLast7Days: { date: string; count: number }[];
    followUpsScheduledNext7Days: number;
  };
  recentPatients: {
    id: number;
    name: string;
    age: number;
    medicalCondition: string;
    lastVisit: string | null;
  }[];
};
