import type { Doctor } from "@/types/doctor";
import { DoctorCard } from "@/components/about/DoctorCard";

type DoctorsGridProps = {
  doctors: Doctor[];
};

export function DoctorsGrid({ doctors }: DoctorsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch auto-rows-fr">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}

