export type Doctor = {
  id: number;
  name: string;
  specialization: string;
  availableDays: string[];
  description?: string | null;
  yearsExperience?: number | null;
};

