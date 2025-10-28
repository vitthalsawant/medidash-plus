import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download, Clock, Heart, Activity, Pill, User } from "lucide-react";

const PatientDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Patient Dashboard</h2>
            <p className="text-muted-foreground">Your appointments, medical records, and documents</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Upcoming Appointments" value="3" change="Next: Tomorrow" icon={<Calendar className="h-5 w-5" />} />
            <StatsCard title="Medical Records" value="24" change="All records" icon={<FileText className="h-5 w-5" />} />
            <StatsCard title="Prescriptions" value="5" change="Active" icon={<Pill className="h-5 w-5" />} />
            <StatsCard title="Documents" value="12" change="Downloads available" icon={<Download className="h-5 w-5" />} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
                <CardDescription>Schedule and manage appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Book Appointment</Button>
                <Button className="w-full" variant="outline">View Upcoming</Button>
                <Button className="w-full" variant="outline">History</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Records
                </CardTitle>
                <CardDescription>View your medical history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">View Records</Button>
                <Button className="w-full" variant="outline">Download Reports</Button>
                <Button className="w-full" variant="outline">Vitals History</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  My Documents
                </CardTitle>
                <CardDescription>Download prescriptions and reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Prescriptions</Button>
                <Button className="w-full" variant="outline">Lab Reports</Button>
                <Button className="w-full" variant="outline">Scans & X-rays</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AppointmentItem date="Tomorrow, 10:00 AM" doctor="Dr. Sarah Johnson" department="Cardiology" />
                  <AppointmentItem date="Dec 5, 02:30 PM" doctor="Dr. Michael Chen" department="General" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your medical activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ActivityItem icon={<FileText />} action="Medical report generated" time="2 days ago" />
                  <ActivityItem icon={<Pill />} action="Prescription issued" time="3 days ago" />
                  <ActivityItem icon={<Calendar />} action="Appointment completed" time="1 week ago" />
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

const AppointmentItem = ({ date, doctor, department }: any) => (
  <div className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium">{doctor}</p>
      <p className="text-xs text-muted-foreground">{department}</p>
      <p className="text-sm text-primary mt-1">{date}</p>
    </div>
  </div>
);

const ActivityItem = ({ icon, action, time }: any) => (
  <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <div className="p-2 bg-primary/10 rounded-md">{icon}</div>
    <div className="flex-1">
      <p className="text-sm">{action}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </div>
);

export default PatientDashboard;

