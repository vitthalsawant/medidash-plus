import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, UserPlus, Clock, Phone, Users, CheckCircle, AlertCircle, Activity } from "lucide-react";

const ReceptionistDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Receptionist Dashboard</h2>
            <p className="text-muted-foreground">Appointment scheduling and patient registration</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Today's Appointments" value="127" change="+8 confirmed" icon={<Calendar className="h-5 w-5" />} />
            <StatsCard title="New Patients" value="12" change="Registered today" icon={<UserPlus className="h-5 w-5" />} />
            <StatsCard title="Waiting Room" value="8" change="Currently waiting" icon={<Clock className="h-5 w-5" />} />
            <StatsCard title="Calls Handled" value="45" change="Today" icon={<Phone className="h-5 w-5" />} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Patient Registration
                </CardTitle>
                <CardDescription>Register new patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Register Patient</Button>
                <Button className="w-full" variant="outline">Search Patient</Button>
                <Button className="w-full" variant="outline">Update Information</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
                <CardDescription>Schedule appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Book Appointment</Button>
                <Button className="w-full" variant="outline">View Schedule</Button>
                <Button className="w-full" variant="outline">Reschedule</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Front Desk
                </CardTitle>
                <CardDescription>Manage front desk operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Check In Patients</Button>
                <Button className="w-full" variant="outline">Waiting List</Button>
                <Button className="w-full" variant="outline">Messages</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Waiting Room</CardTitle>
                <CardDescription>Patients currently waiting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <WaitingPatient name="John Smith" appointment="09:30 AM" waitTime="15 mins" doctor="Dr. Johnson" />
                  <WaitingPatient name="Emma Wilson" appointment="10:00 AM" waitTime="10 mins" doctor="Dr. Chen" />
                  <WaitingPatient name="Michael Brown" appointment="10:15 AM" waitTime="5 mins" doctor="Dr. Patel" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AppointmentCard time="10:30 AM" patient="Lisa Anderson" status="confirmed" />
                  <AppointmentCard time="11:00 AM" patient="Robert Lee" status="pending" />
                  <AppointmentCard time="11:30 AM" patient="Sarah Davis" status="confirmed" />
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

const WaitingPatient = ({ name, appointment, waitTime, doctor }: any) => (
  <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <Users className="h-5 w-5 text-primary flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-muted-foreground">{doctor}</p>
      <p className="text-xs text-primary mt-1">Waiting {waitTime}</p>
    </div>
    <span className="text-sm">{appointment}</span>
  </div>
);

const AppointmentCard = ({ time, patient, status }: any) => (
  <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium">{patient}</p>
      <p className="text-xs text-muted-foreground">Appointment at {time}</p>
    </div>
    <span className={`px-2 py-1 rounded text-xs ${
      status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {status}
    </span>
  </div>
);

export default ReceptionistDashboard;

