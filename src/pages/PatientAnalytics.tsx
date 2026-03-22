import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, RefreshCcw, ClipboardList, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { AnalyticsOverview } from "@/types/analytics";

const PatientAnalytics = () => {
  const { data: overview, isLoading, isError } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiFetch<AnalyticsOverview>("/api/analytics/overview"),
  });

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Could not load analytics.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient analytics</h1>
            <p className="text-muted-foreground mt-1">Volume, revisit rate, and care workload.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/patients">Back to records</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient volume</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{overview.patientVolume}</div>
              <p className="text-xs text-muted-foreground">Total active records</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revisit rate</CardTitle>
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{overview.revisitRate}%</div>
              <p className="text-xs text-muted-foreground">Visited in the last 90 days</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending actions</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{overview.pendingActions}</div>
              <p className="text-xs text-muted-foreground">Follow-ups & profile gaps</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Follow-up queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.pendingFollowUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">None pending.</p>
              ) : (
                overview.pendingFollowUps.map((p) => (
                  <div key={p.id} className="flex justify-between gap-2 text-sm border rounded-md p-2">
                    <span className="font-medium">{p.name}</span>
                    <Link to={`/patients?open=${p.id}`} className="text-primary hover:underline shrink-0">
                      Open
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Incomplete profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.incompleteProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">All key fields captured.</p>
              ) : (
                overview.incompleteProfiles.map((p) => (
                  <div key={p.id} className="flex justify-between gap-2 text-sm border rounded-md p-2">
                    <span className="font-medium">{p.name}</span>
                    <Link to={`/patients?open=${p.id}`} className="text-primary hover:underline shrink-0">
                      Open
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientAnalytics;
