import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Loader2, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Doctor } from "@/types/doctor";
import type { StaffMember } from "@/types/staff";
import { AboutHeader } from "@/components/about/AboutHeader";
import { DoctorsGrid } from "@/components/about/DoctorsGrid";
import { StaffTable } from "@/components/about/StaffTable";
import { DoctorFormModal } from "@/components/about/DoctorFormModal";
import { StaffFormModal } from "@/components/about/StaffFormModal";

const About = () => {
  const [showStaff, setShowStaff] = useState(false);
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);

  const { user, loading } = useAuth();
  const canEdit = !loading && user?.role === "ADMIN";

  const {
    data: doctors,
    isLoading: doctorsLoading,
    isError: doctorsError,
    error: doctorsErrorObj,
  } = useQuery({
    queryKey: ["about", "doctors"],
    queryFn: () => publicFetch<Doctor[]>("/api/about/doctors"),
  });

  const {
    data: staff,
    isLoading: staffLoading,
    isError: staffError,
    error: staffErrorObj,
  } = useQuery({
    queryKey: ["about", "staff"],
    queryFn: () => publicFetch<StaffMember[]>("/api/about/staff"),
  });

  const highlights = useMemo(
    () => [
      "Centralised patient records",
      "Easy patient search and management",
      "Appointment tracking",
      "Smart alerts and follow-ups",
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl space-y-10">
        <section>
          <AboutHeader
            title="About SehatSync"
            description="SehatSync is a smart, centralised patient management dashboard that brings clinical data into one place, simplifies healthcare data workflows, and improves day-to-day efficiency for clinics. It helps teams reduce fragmented records by connecting patient profiles, visits, and operational alerts in a consistent system."
            highlights={highlights}
          />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Doctors</h2>
            </div>
            {canEdit && (
              <Button variant="outline" type="button" size="sm" onClick={() => setAddDoctorOpen(true)}>
                Add Doctor
              </Button>
            )}
          </div>

          {doctorsLoading ? (
            <div className="min-h-[120px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : doctorsError ? (
            <Card className="border-border">
              <CardContent className="py-8 text-muted-foreground">
                {doctorsErrorObj instanceof Error ? doctorsErrorObj.message : "Could not load doctor profiles."}
              </CardContent>
            </Card>
          ) : !doctors || doctors.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-8 text-muted-foreground">No doctors found in the database.</CardContent>
            </Card>
          ) : (
            <DoctorsGrid doctors={doctors} />
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Staff</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={() => setAddStaffOpen(true)}
                >
                  Add Staff
                </Button>
              )}
              <Button variant="outline" type="button" onClick={() => setShowStaff((v) => !v)}>
                {showStaff ? "Hide Staff" : "View Staff"}
              </Button>
            </div>
          </div>

          {showStaff && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Staff directory
                </CardTitle>
              </CardHeader>

              {staffLoading ? (
                <CardContent className="py-8 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              ) : staffError ? (
                <CardContent className="py-8 text-muted-foreground">
                  {staffErrorObj instanceof Error ? staffErrorObj.message : "Could not load staff records."}
                </CardContent>
              ) : !staff || staff.length === 0 ? (
                <CardContent className="py-8 text-muted-foreground">No staff records found.</CardContent>
              ) : (
                <StaffTable staff={staff} canEdit={canEdit} />
              )}
            </Card>
          )}
        </section>
      </div>

      <DoctorFormModal open={addDoctorOpen} onClose={() => setAddDoctorOpen(false)} />
      <StaffFormModal open={addStaffOpen} onClose={() => setAddStaffOpen(false)} />
    </div>
  );
};

export default About;
