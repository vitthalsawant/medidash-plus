import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Calendar, FileText, LogOut, Settings } from "lucide-react";

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();

  const getDashboardContent = () => {
    if (!userRole) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No role assigned. Please contact your administrator.</p>
        </div>
      );
    }

    const role = userRole.role;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              {role === 'super_admin' && 'Super Admin Dashboard'}
              {role === 'admin' && 'Admin Dashboard'}
              {role === 'doctor' && 'Doctor Dashboard'}
              {role === 'patient' && 'Patient Dashboard'}
              {role === 'nurse' && 'Nurse Dashboard'}
              {role === 'receptionist' && 'Receptionist Dashboard'}
            </h2>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Patients"
            value="1,234"
            icon={<Users className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Appointments"
            value="45"
            icon={<Calendar className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Medical Records"
            value="892"
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <StatsCard
            title="Active Doctors"
            value="23"
            icon={<Activity className="h-6 w-6 text-primary" />}
          />
        </div>

        {/* Role-specific content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Activity feed coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {role === 'receptionist' && (
                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              )}
              {role === 'doctor' && (
                <>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Prescription
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    View Patients
                  </Button>
                </>
              )}
              {(role === 'admin' || role === 'super_admin') && (
                <>
                  <Button className="w-full" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </>
              )}
              {role === 'patient' && (
                <>
                  <Button className="w-full" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Appointments
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Medical Records
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">MediDash Plus</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
};

const StatsCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default Dashboard;