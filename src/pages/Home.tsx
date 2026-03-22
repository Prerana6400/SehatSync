import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Shield, Clock, Heart, UserPlus, Loader2 } from "lucide-react";
import { publicFetch } from "@/lib/api";

type PublicSummary = {
  patientCount: number;
  visitCount: number;
  visitsThisMonth: number;
};

const Home = () => {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["public", "summary"],
    queryFn: () => publicFetch<PublicSummary>("/api/public/summary"),
    staleTime: 60_000,
  });

  const features = [
    {
      icon: Users,
      title: "Patient chart & demographics",
      description:
        "Register patients with contacts, allergies, and problem list. Each chart shows a medical record number (MRN) for front-desk and clinical use.",
    },
    {
      icon: Shield,
      title: "Role-based access",
      description:
        "Staff sign in with JWT-secured sessions. Reception, nursing, and physician roles can be enforced on the API for real deployments.",
    },
    {
      icon: Clock,
      title: "Encounters & follow-up",
      description:
        "Log visits with chief complaint, assessment, and notes. Recent activity feeds the analytics dashboard for workload and follow-up tracking.",
    },
    {
      icon: Heart,
      title: "Care-team oriented",
      description:
        "Designed for outpatient-style workflows: quick search, chart review, and encounter documentation in one place.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light to-background">
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Activity className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <span className="text-primary">SehatSync</span> — patient records
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A focused front-end for clinics to register patients, document encounters, and see operational
            metrics. Connects to your own PostgreSQL database via the included API.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/patients">
              <Button size="lg" className="text-lg px-8 py-3">
                <Users className="h-5 w-5 mr-2" />
                Open patient list
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <UserPlus className="h-5 w-5 mr-2" />
                Staff sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What you can do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-left hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Icon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 py-12">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">
            Live counts from your database
          </h3>
          {summaryLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2 tabular-nums">
                  {summary?.patientCount ?? "—"}
                </h3>
                <p className="text-muted-foreground">Patients on file</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2 tabular-nums">
                  {summary?.visitCount ?? "—"}
                </h3>
                <p className="text-muted-foreground">Encounters recorded</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2 tabular-nums">
                  {summary?.visitsThisMonth ?? "—"}
                </h3>
                <p className="text-muted-foreground">Encounters this month</p>
              </div>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground mt-6 max-w-xl mx-auto">
            Requires the API and database running. If numbers show &quot;—&quot;, start the backend or check
            your connection.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to use the dashboard?</h2>
          <p className="text-muted-foreground mb-8">
            Sign in with a staff account, then open the patient list to search, open charts, and log
            encounters.
          </p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-8 py-3">
              Go to sign in
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
