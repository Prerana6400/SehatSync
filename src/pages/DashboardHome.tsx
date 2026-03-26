import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, endOfDay } from "date-fns";
import {
  Users,
  UserPlus,
  ClipboardList,
  UserX,
  Activity,
  BarChart3,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appointmentStatusVariant } from "@/components/AppointmentTable";
import { DashboardCard } from "@/components/DashboardCard";
import { apiFetch } from "@/lib/api";
import type { AppointmentRow } from "@/types/appointment";
import type { DashboardOverview } from "@/types/dashboard";

const DashboardHome = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => apiFetch<DashboardOverview>("/api/dashboard/overview"),
  });
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();
  const { data: todaysAppointments = [] } = useQuery({
    queryKey: ["appointments", "today", todayStart, todayEnd],
    queryFn: () =>
      apiFetch<AppointmentRow[]>(
        `/api/appointments?from=${encodeURIComponent(todayStart)}&to=${encodeURIComponent(todayEnd)}`
      ),
  });

  const [chartRange, setChartRange] = useState<"weekly" | "daily">("weekly");

  const chartData =
    (chartRange === "daily"
      ? data?.activity.dailyVisitsLast7Days.map((d) => ({
          label: d.date.slice(5),
          visits: d.count,
        }))
      : data?.activity.weeklyVisitsLast4Weeks.map((w) => ({
          label: w.date.slice(5),
          visits: w.count,
        }))) ?? [];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    const hint = error instanceof Error ? error.message : "";
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg mx-auto text-center space-y-3">
        <p className="text-destructive font-medium">Could not load dashboard</p>
        <p className="text-sm text-muted-foreground">
          {hint ||
            "Ensure you are signed in and the API is running. If you see a database error, start PostgreSQL and check DATABASE_URL in .env."}
        </p>
      </div>
    );
  }

  const { stats, activity } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinic overview</h1>
          <p className="text-muted-foreground mt-1">
            SehatSync — smart centralised patient management. Key metrics and recent activity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total patients"
            value={stats.totalPatients}
            hint="All active records"
            icon={Users}
          />
          <DashboardCard
            title="New this week"
            value={stats.newPatientsThisWeek}
            hint="Registered since Monday"
            icon={UserPlus}
          />
          <DashboardCard
            title="Pending follow-ups"
            value={stats.pendingFollowUps}
            hint="Review or overdue visits"
            icon={ClipboardList}
          />
          <DashboardCard
            title="Incomplete profiles"
            value={stats.incompleteProfiles}
            hint="Missing key fields"
            icon={UserX}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  {chartRange === "daily"
                    ? "Daily patient visits (last 7 days)"
                    : "Weekly patient visits (last 4 weeks)"}
                </CardTitle>

                <Tabs value={chartRange} onValueChange={(v) => setChartRange(v as "weekly" | "daily")}>
                  <TabsList>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Visits" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Follow-ups scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {activity.followUpsScheduledNext7Days}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Appointments in the next 7 days (scheduled or confirmed).
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Today's appointments</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/appointments">Open appointments</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
            ) : (
              todaysAppointments.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-border p-3"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{a.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.doctorName} · {format(new Date(a.startAt), "h:mm a")}
                    </p>
                  </div>
                  <Badge variant={appointmentStatusVariant[a.status]}>{a.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button asChild>
            <Link to="/patients">
              <Users className="h-4 w-4 mr-2" />
              View all patient records
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/patients" state={{ openAdd: true }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add new patient
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Patient analytics
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
