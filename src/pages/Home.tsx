import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Shield, Clock, Heart, UserPlus } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient record management with detailed profiles and medical history tracking."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Advanced security measures to protect sensitive patient information and comply with healthcare standards."
    },
    {
      icon: Clock,
      title: "Quick Access",
      description: "Fast search and filter capabilities to quickly locate patient records when you need them."
    },
    {
      icon: Heart,
      title: "Care Focused",
      description: "Designed with healthcare professionals in mind to improve patient care and workflow efficiency."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Activity className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-primary">Jarurat Care</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A comprehensive patient records management system designed to streamline healthcare operations 
            and improve patient care through efficient data management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/patients">
              <Button size="lg" className="text-lg px-8 py-3">
                <Users className="h-5 w-5 mr-2" />
                View Patients
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => {
                const event = new CustomEvent('openAddPatient');
                window.dispatchEvent(event);
              }}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add New Patient
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Why Choose Jarurat Care?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Icon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">500+</h3>
              <p className="text-muted-foreground">Patients Managed</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">24/7</h3>
              <p className="text-muted-foreground">System Availability</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">100%</h3>
              <p className="text-muted-foreground">Data Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Begin managing patient records more efficiently with Jarurat Care's 
            intuitive and powerful patient management system.
          </p>
          <Link to="/patients">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;