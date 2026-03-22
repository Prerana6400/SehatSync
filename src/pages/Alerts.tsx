import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCard } from "@/components/AlertCard";
import { apiFetch } from "@/lib/api";
import type { AlertOverview } from "@/types/alerts";

const Alerts = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["alerts", "overview"],
    queryFn: () => apiFetch<AlertOverview>("/api/alerts/overview"),
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Could not load alerts. Sign in and ensure the API is running.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Alerts & follow-ups
          </h1>
          <p className="text-muted-foreground mt-1">
            Patients and appointments that need attention.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Overdue follow-ups</h2>
          {data.overdueFollowUps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No overdue follow-ups.</p>
          ) : (
            <div className="space-y-3">
              {data.overdueFollowUps.map(({ patient, issue }) => (
                <AlertCard
                  key={`fu-${patient.id}`}
                  title={patient.name}
                  description={issue}
                  primaryAction={{
                    label: "View profile",
                    onClick: () => navigate(`/patients?open=${patient.id}`),
                  }}
                  secondaryAction={{
                    label: "Schedule follow-up",
                    onClick: () => navigate(`/appointments`),
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Upcoming appointments</h2>
          {data.upcomingAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments in the next few days.</p>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Next 3 days</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.upcomingAppointments.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{a.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.doctorName} · {format(new Date(a.startAt), "MMM d, yyyy h:mm a")} · {a.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:underline text-left sm:text-right"
                      onClick={() => navigate("/appointments")}
                    >
                      Open appointments
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Patients needing checkups</h2>
          {data.needingCheckups.length === 0 ? (
            <p className="text-sm text-muted-foreground">All patients have a recent visit on file.</p>
          ) : (
            <div className="space-y-3">
              {data.needingCheckups.map(({ patient, issue }) => (
                <AlertCard
                  key={`chk-${patient.id}`}
                  title={patient.name}
                  description={issue}
                  primaryAction={{
                    label: "View profile",
                    onClick: () => navigate(`/patients?open=${patient.id}`),
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Incomplete patient profiles</h2>
          {data.incompleteProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incomplete profiles flagged.</p>
          ) : (
            <div className="space-y-3">
              {data.incompleteProfiles.map(({ patient, issue }) => (
                <AlertCard
                  key={`prof-${patient.id}`}
                  title={patient.name}
                  description={issue}
                  primaryAction={{
                    label: "Complete profile",
                    onClick: () => navigate(`/patients?open=${patient.id}`),
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Alerts;
