import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clipboard, Activity, Clock, Heart, Pill, Stethoscope, TrendingUp } from "lucide-react";

const NurseDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Nurse Dashboard</h2>
            <p className="text-muted-foreground">Patient care records and medication tracking</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Assigned Patients" value="28" change="Today" icon={<Users className="h-5 w-5" />} />
            <StatsCard title="Vitals Updated" value="45" change="This shift" icon={<Activity className="h-5 w-5" />} />
            <StatsCard title="Medications Due" value="12" change="Pending" icon={<Pill className="h-5 w-5" />} />
            <StatsCard title="Tasks Completed" value="36" change="Today" icon={<Clipboard className="h-5 w-5" />} />
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
                <Button className="w-full" variant="default">View All</Button>
                <Button className="w-full" variant="outline">Active Patients</Button>
                <Button className="w-full" variant="outline">Recent Updates</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vital Signs
                </CardTitle>
                <CardDescription>Update patient vitals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Update Vitals</Button>
                <Button className="w-full" variant="outline">View Trends</Button>
                <Button className="w-full" variant="outline">Alerts</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medications
                </CardTitle>
                <CardDescription>Track medications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Due Medications</Button>
                <Button className="w-full" variant="outline">Administer</Button>
                <Button className="w-full" variant="outline">Schedule</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patient Updates</CardTitle>
                <CardDescription>Latest vital signs recorded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PatientUpdate name="John Smith" vitals="BP: 120/80, Temp: 98.6°F" time="5 mins ago" />
                  <PatientUpdate name="Emma Wilson" vitals="BP: 110/70, Temp: 97.8°F" time="12 mins ago" />
                  <PatientUpdate name="Michael Brown" vitals="BP: 135/85, Temp: 99.2°F" time="20 mins ago" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Pending patient care tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <TaskItem task="Administer medication" patient="Lisa Anderson" time="in 15 mins" priority="high" />
                  <TaskItem task="Vital signs check" patient="Robert Lee" time="in 30 mins" priority="medium" />
                  <TaskItem task="Medication review" patient="Sarah Davis" time="in 1 hour" priority="low" />
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

const PatientUpdate = ({ name, vitals, time }: any) => (
  <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <Stethoscope className="h-5 w-5 text-primary flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-muted-foreground">{vitals}</p>
      <p className="text-xs text-primary mt-1">{time}</p>
    </div>
  </div>
);

const TaskItem = ({ task, patient, time, priority }: any) => (
  <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium">{task}</p>
      <p className="text-xs text-muted-foreground">{patient}</p>
      <p className="text-xs text-primary mt-1">{time}</p>
    </div>
    <span className={`px-2 py-1 rounded text-xs ${
      priority === 'high' ? 'bg-red-100 text-red-700' :
      priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
      'bg-blue-100 text-blue-700'
    }`}>
      {priority}
    </span>
  </div>
);

export default NurseDashboard;

