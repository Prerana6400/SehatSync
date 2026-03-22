import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, Users, Award, Mail, BookOpen, AlertCircle } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Patient safety first",
      description:
        "Charts highlight allergies and problem lists so the whole team sees critical context before documenting a new encounter.",
    },
    {
      icon: Users,
      title: "Built for small teams",
      description:
        "Reception can register patients; clinicians and nurses can add visits and notes with clear timestamps and provider labels.",
    },
    {
      icon: Award,
      title: "Operational clarity",
      description:
        "The analytics view surfaces volume, revisit patterns, and pending follow-ups—so managers can spot backlog without exporting spreadsheets.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Activity className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About SehatSync</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            SehatSync is an open, self-hosted style patient registry and encounter log for teaching, demos, and
            small-practice pilots. It pairs a React dashboard with a Node API and PostgreSQL so you own the
            data and can extend the schema as you grow.
          </p>
        </div>

        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <CardTitle className="text-lg">Important notice</CardTitle>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                This software is <strong>not</strong> a certified medical device and is <strong>not</strong>{" "}
                a substitute for a full EHR or legal compliance with HIPAA, GDPR, or local healthcare rules.
                Do not use real patient data until you have completed a proper security and compliance review
                for your environment.
              </p>
            </div>
          </CardHeader>
        </Card>

        <section className="mb-12">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-2xl">Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Give developers and clinic innovators a <strong>realistic</strong> foundation: authenticated
                APIs, relational data, encounter history, and dashboards that behave like production tools—so
                you can iterate on workflows instead of wiring mocks forever.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-3">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-center">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Stack &amp; documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Frontend:</strong> React, TypeScript, Vite, Tailwind,
                shadcn/ui, TanStack Query.
              </p>
              <p>
                <strong className="text-foreground">Backend:</strong> Express, Prisma, PostgreSQL, JWT auth
                with role enums (admin, doctor, nurse, reception).
              </p>
              <p>
                See the project <code className="text-xs bg-muted px-1 py-0.5 rounded">README.md</code> for
                environment variables, database setup, and how to run API + UI together.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-center">Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">
                Product inquiries: <span className="text-foreground">support@sehatsync.com</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Replace with your organization&apos;s support address when you fork or deploy this project.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
