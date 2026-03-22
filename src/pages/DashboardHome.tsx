import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardCard } from "@/components/DashboardCard";
import { apiFetch } from "@/lib/api";
import type { DashboardOverview } from "@/types/dashboard";
import { formatVisitDate } from "@/lib/format";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => apiFetch<DashboardOverview>("/api/dashboard/overview"),
  });

  const chartData =
    data?.activity.dailyVisitsLast7Days.map((d) => ({
      label: d.date.slice(5),
      visits: d.count,
    })) ?? [];

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

  const { stats, activity, recentPatients } = data;

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
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Daily patient visits (last 7 days)
              </CardTitle>
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
            <CardTitle className="text-lg">Recent patients</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/patients">View all records</Link>
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Medical condition</TableHead>
                  <TableHead>Last visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      No patients yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentPatients.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/patients?open=${p.id}`)}
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.age}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{p.medicalCondition}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.lastVisit ? formatVisitDate(p.lastVisit) : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
