import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileCheck, Activity, Clock, TrendingUp, Bed, Heart } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Admin Dashboard</h2>
            <p className="text-muted-foreground">Hospital operations and staff management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Staff" value="156" change="+5 this month" icon={<Users className="h-5 w-5" />} />
            <StatsCard title="Today's Appointments" value="127" change="+12%" icon={<Calendar className="h-5 w-5" />} />
            <StatsCard title="Documents Verified" value="89" change="Today" icon={<FileCheck className="h-5 w-5" />} />
            <StatsCard title="Active Patients" value="2,348" change="+45 today" icon={<Heart className="h-5 w-5" />} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Management
                </CardTitle>
                <CardDescription>Manage doctors, nurses, and staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Manage Doctors</Button>
                <Button className="w-full" variant="outline">Manage Nurses</Button>
                <Button className="w-full" variant="outline">Staff Schedule</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
                <CardDescription>View and manage appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">View All</Button>
                <Button className="w-full" variant="outline">Today's Schedule</Button>
                <Button className="w-full" variant="outline">Pending Approvals</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Document Verification
                </CardTitle>
                <CardDescription>Review uploaded documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Pending (3)</Button>
                <Button className="w-full" variant="outline">View All Documents</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Staff Additions</CardTitle>
                <CardDescription>New staff members this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <StaffItem name="Dr. Sarah Johnson" role="Doctor" department="Cardiology" />
                  <StaffItem name="Emily Chen" role="Nurse" department="Pediatrics" />
                  <StaffItem name="Michael Brown" role="Receptionist" department="Front Desk" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule Overview</CardTitle>
                <CardDescription>Appointment statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ScheduleItem label="Scheduled" value="127" color="bg-blue-500" />
                  <ScheduleItem label="Completed" value="98" color="bg-green-500" />
                  <ScheduleItem label="Cancelled" value="8" color="bg-red-500" />
                  <ScheduleItem label="No Show" value="3" color="bg-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatsCard = ({ title, value, change, icon }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{change}</p>
    </CardContent>
  </Card>
);

const StaffItem = ({ name, role, department }: any) => (
  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
    <div>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-muted-foreground">{role} - {department}</p>
    </div>
    <Button size="sm" variant="ghost">View</Button>
  </div>
);

const ScheduleItem = ({ label, value, color }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm">{label}</span>
    </div>
    <span className="font-semibold">{value}</span>
  </div>
);

export default AdminDashboard;

