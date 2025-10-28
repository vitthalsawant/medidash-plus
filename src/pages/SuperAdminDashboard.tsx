import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Database, Settings, Activity, TrendingUp, AlertTriangle, FileText } from "lucide-react";

const SuperAdminDashboard = () => {
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold">Super Admin Dashboard</h2>
            <p className="text-muted-foreground">Full system access and user management</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value="1,245"
              change="+12%"
              icon={<Users className="h-5 w-5" />}
            />
            <StatsCard
              title="Active Roles"
              value="6"
              change="All"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
            <StatsCard
              title="System Health"
              value="98%"
              change="Excellent"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatsCard
              title="Pending Requests"
              value="3"
              change="Low"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage all users and roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">
                  Manage Users
                </Button>
                <Button className="w-full" variant="outline">
                  Assign Roles
                </Button>
                <Button className="w-full" variant="outline">
                  View Activity Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">
                  Database Settings
                </Button>
                <Button className="w-full" variant="outline">
                  Backup & Restore
                </Button>
                <Button className="w-full" variant="outline">
                  System Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">
                  Access Control
                </Button>
                <Button className="w-full" variant="outline">
                  Audit Trail
                </Button>
                <Button className="w-full" variant="outline">
                  Security Policies
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ActivityItem time="2 mins ago" action="User assigned admin role" />
                  <ActivityItem time="15 mins ago" action="System backup completed" />
                  <ActivityItem time="1 hour ago" action="New user registered" />
                  <ActivityItem time="2 hours ago" action="Role permissions updated" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Database" value="Supabase" />
                  <InfoRow label="Version" value="v2.1.0" />
                  <InfoRow label="Last Backup" value="Today, 2:30 AM" />
                  <InfoRow label="Uptime" value="99.9%" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatsCard = ({ title, value, change, icon }: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode 
}) => (
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

const ActivityItem = ({ time, action }: { time: string; action: string }) => (
  <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
    <Activity className="h-4 w-4 text-primary flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm">{action}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default SuperAdminDashboard;

