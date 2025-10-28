import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, Clipboard, Stethoscope, Clock, Activity, Pill } from "lucide-react";

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Doctor Dashboard</h2>
            <p className="text-muted-foreground">Patient records, appointments, and prescriptions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="My Patients" value="142" change="Assigned" icon={<Users className="h-5 w-5" />} />
            <StatsCard title="Today's Appointments" value="8" change="Next in 15 mins" icon={<Calendar className="h-5 w-5" />} />
            <StatsCard title="Prescriptions" value="234" change="This month" icon={<Pill className="h-5 w-5" />} />
            <StatsCard title="Pending Reviews" value="12" change="Action needed" icon={<FileText className="h-5 w-5" />} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Patients
                </CardTitle>
                <CardDescription>View assigned patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">View All Patients</Button>
                <Button className="w-full" variant="outline">Search Patient</Button>
                <Button className="w-full" variant="outline">Recent Visits</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
                <CardDescription>Manage your schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Today's Schedule</Button>
                <Button className="w-full" variant="outline">Upcoming Appointments</Button>
                <Button className="w-full" variant="outline">Set Availability</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescriptions
                </CardTitle>
                <CardDescription>Create and manage prescriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Create Prescription</Button>
                <Button className="w-full" variant="outline">View Recent</Button>
                <Button className="w-full" variant="outline">Upload Reports</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Today's schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AppointmentItem time="09:00 AM" patient="John Smith" reason="Follow-up" />
                  <AppointmentItem time="10:30 AM" patient="Emma Wilson" reason="Consultation" />
                  <AppointmentItem time="02:00 PM" patient="Robert Brown" reason="Checkup" />
                  <AppointmentItem time="04:15 PM" patient="Lisa Anderson" reason="Review" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Prescriptions</CardTitle>
                <CardDescription>Latest prescriptions issued</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PrescriptionItem patient="John Smith" date="2 hours ago" status="Active" />
                  <PrescriptionItem patient="Emma Wilson" date="5 hours ago" status="Active" />
                  <PrescriptionItem patient="Michael Davis" date="Yesterday" status="Completed" />
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

const AppointmentItem = ({ time, patient, reason }: any) => (
  <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <div className="flex-shrink-0">
      <Clock className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{patient}</p>
      <p className="text-xs text-muted-foreground">{reason}</p>
    </div>
    <span className="text-sm font-medium">{time}</span>
  </div>
);

const PrescriptionItem = ({ patient, date, status }: any) => (
  <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <div>
      <p className="text-sm font-medium">{patient}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
    <Button size="sm" variant="ghost">{status}</Button>
  </div>
);

export default DoctorDashboard;

