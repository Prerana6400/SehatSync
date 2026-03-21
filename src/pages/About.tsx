import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, Users, Award, Mail, Phone, MapPin } from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "15+ years in healthcare management and digital health solutions."
    },
    {
      name: "Alex Chen",
      role: "Lead Developer",
      description: "Expert in healthcare software development and data security."
    },
    {
      name: "Maria Rodriguez",
      role: "UX Designer",
      description: "Specialized in creating intuitive interfaces for healthcare professionals."
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Patient-Centric",
      description: "Every feature is designed with patient care and safety as the top priority."
    },
    {
      icon: Users,
      title: "Healthcare Teams",
      description: "Built for healthcare professionals by healthcare professionals."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality healthcare management tools."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Activity className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Jarurat Care
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Jarurat Care is a modern patient records management system designed to revolutionize 
            how healthcare providers manage patient information, streamline workflows, and improve care quality.
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-16">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To provide healthcare professionals with intuitive, secure, and efficient tools that enhance 
                patient care delivery while reducing administrative burden. We believe that better data management 
                leads to better patient outcomes.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-primary font-semibold">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Technology & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Jarurat Care is built using modern web technologies including React, TypeScript, and Tailwind CSS, 
                ensuring a fast, reliable, and maintainable platform.
              </p>
              <p className="text-muted-foreground">
                We prioritize data security and privacy, implementing industry-standard encryption and security 
                measures to protect sensitive patient information in compliance with healthcare regulations.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="font-semibold">React</p>
                  <p className="text-sm text-muted-foreground">Frontend</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="font-semibold">TypeScript</p>
                  <p className="text-sm text-muted-foreground">Type Safety</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="font-semibold">Tailwind</p>
                  <p className="text-sm text-muted-foreground">Styling</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="font-semibold">Secure</p>
                  <p className="text-sm text-muted-foreground">HIPAA Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section>
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Mail className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">support@jaruratcare.com</p>
                </div>
                <div className="flex flex-col items-center">
                  <Phone className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-muted-foreground">123 Healthcare Ave<br />Medical District, NY 10001</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;