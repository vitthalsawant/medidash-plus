import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import NurseDashboard from "./NurseDashboard";
import ReceptionistDashboard from "./ReceptionistDashboard";

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If no role assigned, redirect to home
  if (!userRole) {
    return <Navigate to="/home" replace />;
  }

  // Route to appropriate dashboard based on role
  switch (userRole.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'patient':
      return <PatientDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    default:
      return <Navigate to="/home" replace />;
  }
};

export default Dashboard;