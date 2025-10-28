import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Activity, Users, Calendar, FileText, Shield, Clock } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">MediDash Plus</h1>
          </div>
          <Button onClick={() => navigate('/auth')} size="lg">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Complete Hospital Management System
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your healthcare operations with our comprehensive platform designed for
            modern hospitals and clinics.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/auth')} size="lg" className="btn-gradient">
              Get Started
            </Button>
            <Button onClick={() => navigate('/auth')} variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Patient Management"
            description="Complete patient records, medical history, and demographics in one secure location."
          />
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-primary" />}
            title="Appointment Scheduling"
            description="Efficient booking system with automated reminders and calendar management."
          />
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-primary" />}
            title="Medical Records"
            description="Digital prescriptions, lab reports, and complete treatment history."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-primary" />}
            title="Role-Based Access"
            description="Secure authentication with 6 user roles and granular permissions."
          />
          <FeatureCard
            icon={<Activity className="h-10 w-10 text-primary" />}
            title="Analytics Dashboard"
            description="Real-time insights into hospital operations and performance metrics."
          />
          <FeatureCard
            icon={<Clock className="h-10 w-10 text-primary" />}
            title="24/7 Accessibility"
            description="Access your hospital data anytime, anywhere, on any device."
          />
        </div>

        {/* User Roles Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Built for Every Healthcare Professional</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RoleCard role="Super Admin" description="Complete system control and user management" />
            <RoleCard role="Admin" description="Hospital operations and staff oversight" />
            <RoleCard role="Doctor" description="Patient care and prescription management" />
            <RoleCard role="Patient" description="View appointments and medical records" />
            <RoleCard role="Nurse" description="Patient care tracking and medication logs" />
            <RoleCard role="Receptionist" description="Appointment scheduling and check-ins" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 MediDash Plus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="card-elevated p-6 hover:scale-105 transition-transform duration-300">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const RoleCard = ({ role, description }: { role: string; description: string }) => (
  <div className="bg-card border rounded-lg p-6 hover:border-primary transition-colors">
    <h4 className="font-semibold text-lg mb-2">{role}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
