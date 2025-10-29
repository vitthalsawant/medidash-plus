import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarComponent,
} from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Activity, Calendar, Users, Pill, FileText, LogOut, 
  User, Settings, Plus, Building2, Stethoscope, Heart, 
  Shield, Clock, TrendingUp, Award, Home as HomeIcon,
  Eye, ArrowUpRight, ArrowDownRight, DollarSign, Briefcase,
  ClipboardList, CheckCircle, AlertCircle, Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAppointmentsDialogOpen, setIsAppointmentsDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insights, setInsights] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [appointmentData, setAppointmentData] = useState({
    doctor_id: '',
    appointment_date: undefined as Date | undefined,
    appointment_time: '',
    reason: ''
  });

  useEffect(() => {
    fetchInsights();
    fetchRecentActivity();
    fetchDoctors(); // Load doctors on component mount
    if (isAppointmentsDialogOpen) {
      loadAppointments();
    }
  }, [userRole, isAppointmentsDialogOpen]);

  const loadAppointments = async () => {
    try {
      if (!user) return;

      let query = supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          reason,
          status,
          created_at,
          doctors(full_name, specialization),
          patients(full_name)
        `)
        .order('appointment_date', { ascending: false })
        .limit(10);

      // Filter based on user role
      if (userRole?.role === 'patient') {
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (patientData) {
          query = query.eq('patient_id', patientData.id);
        }
      } else if (userRole?.role === 'doctor') {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (doctorData) {
          query = query.eq('doctor_id', doctorData.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        // Fall back to demo appointments only
        const demo = getDemoAppointmentsForUser();
        setAppointments(demo);
        return;
      }

      // Merge DB appointments with demo ones (patient view only)
      const demo = getDemoAppointmentsForUser();
      const merged = Array.isArray(data) ? [...data, ...demo] : demo;
      setAppointments(merged);
      console.log('Loaded appointments:', merged.length, 'appointments (db + demo)');
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const demo = getDemoAppointmentsForUser();
      setAppointments(demo);
    }
  };

  // Demo appointments storage helpers
  const demoKey = user?.id ? `demo_appointments_${user.id}` : 'demo_appointments';
  const getDemoAppointmentsForUser = () => {
    try {
      const raw = localStorage.getItem(demoKey);
      const list = raw ? JSON.parse(raw) : [];
      // Filter by role if needed later; currently patient-only demo
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };
  const saveDemoAppointment = (appt: any) => {
    try {
      const list = getDemoAppointmentsForUser();
      const updated = [appt, ...list];
      localStorage.setItem(demoKey, JSON.stringify(updated));
    } catch {}
  };

  const fetchInsights = async () => {
    try {
      if (!userRole || !user) return;

      switch (userRole.role) {
        case 'patient':
          const { data: patientData } = await supabase
            .from('patients')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (patientData) {
            // Get patient's appointments
            const { data: appointments } = await supabase
              .from('appointments')
              .select('status')
              .eq('patient_id', patientData.id);

            // Get medical records count
            const { data: records } = await supabase
              .from('medical_records')
              .select('id')
              .eq('patient_id', patientData.id);

            // Get prescriptions count
            const { data: prescriptions } = await supabase
              .from('prescriptions')
              .select('id')
              .eq('patient_id', patientData.id);

            setInsights({
              totalAppointments: appointments?.length || 0,
              upcomingAppointments: appointments?.filter((a: any) => ['scheduled', 'confirmed'].includes(a.status)).length || 0,
              medicalRecords: records?.length || 0,
              prescriptions: prescriptions?.length || 0,
            });
          }
          break;

        case 'doctor':
          const { data: doctorData } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (doctorData) {
            // Get doctor's appointments
            const { data: appointments } = await supabase
              .from('appointments')
              .select('status')
              .eq('doctor_id', doctorData.id);

            // Get patients count
            const { data: allAppointments } = await supabase
              .from('appointments')
              .select('patient_id')
              .eq('doctor_id', doctorData.id);
            
            const uniquePatients = new Set(allAppointments?.map((a: any) => a.patient_id) || []);
            const patients = Array.from(uniquePatients).map(id => ({ id }));

            // Get medical records count
            const { data: records } = await supabase
              .from('medical_records')
              .select('id')
              .eq('doctor_id', doctorData.id);

            setInsights({
              todayAppointments: appointments?.filter((a: any) => a.status === 'scheduled' || a.status === 'confirmed').length || 0,
              totalPatients: patients?.length || 0,
              completedAppointments: appointments?.filter((a: any) => a.status === 'completed').length || 0,
              medicalRecords: records?.length || 0,
            });
          }
          break;

        case 'receptionist':
        case 'admin':
          // Get overall hospital stats
          const { data: appointments } = await supabase
            .from('appointments')
            .select('status');

          const { data: patients } = await supabase
            .from('patients')
            .select('id');

          const { data: doctorsList } = await supabase
            .from('doctors')
            .select('id');

          setInsights({
            totalPatients: patients?.length || 0,
            totalDoctors: doctorsList?.length || 0,
            totalAppointments: appointments?.length || 0,
            pendingAppointments: appointments?.filter((a: any) => a.status === 'scheduled').length || 0,
          });
          break;
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      if (!userRole || !user) {
        setRecentActivity([]);
        return;
      }

      switch (userRole.role) {
        case 'patient':
          const { data: patientData } = await supabase
            .from('patients')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (patientData) {
            const { data: recentAppointments } = await supabase
              .from('appointments')
              .select(`
                id,
                appointment_date,
                appointment_time,
                status,
                reason,
                doctors:doctor_id (
                  full_name
                )
              `)
              .eq('patient_id', patientData.id)
              .order('appointment_date', { ascending: false })
              .limit(5);

            setRecentActivity(recentAppointments || []);
          }
          break;

        case 'doctor':
          const { data: doctorData } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (doctorData) {
            const { data: recentAppointments } = await supabase
              .from('appointments')
              .select(`
                id,
                appointment_date,
                appointment_time,
                status,
                patients:patient_id (
                  full_name
                )
              `)
              .eq('doctor_id', doctorData.id)
              .order('appointment_date', { ascending: false })
              .limit(5);

            setRecentActivity(recentAppointments || []);
          }
          break;

        case 'receptionist':
        case 'admin':
          const { data: allRecentAppointments } = await supabase
            .from('appointments')
            .select(`
              id,
              appointment_date,
              appointment_time,
              status,
              patients:patient_id (
                full_name
              ),
              doctors:doctor_id (
                full_name
              )
            `)
            .order('created_at', { ascending: false })
            .limit(5);

          setRecentActivity(allRecentAppointments || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialization')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching doctors:', error);
        console.log('Using fallback doctors due to database error');
        setDoctors(getFallbackDoctors());
        
        // Show helpful message to user
        toast({
          title: "Demo Mode",
          description: "Database error. Using demo doctors. Run 'setup-database.bat' to fix database.",
          duration: 5000,
        });
        return;
      }
      
          if (!data || data.length === 0) {
            console.log('No doctors found in database, using fallback doctors');
            setDoctors(getFallbackDoctors());
            
            // Show helpful message to user
            toast({
              title: "Demo Mode",
              description: "No doctors in database. Using demo doctors. Run 'setup-database.bat' to add real doctors.",
              duration: 5000,
            });
            return;
          }
      
      setDoctors(data);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      console.log('Using fallback doctors due to error');
      setDoctors(getFallbackDoctors());
    }
  };

  const getFallbackDoctors = () => [
    { id: 'fallback-1', full_name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
    { id: 'fallback-2', full_name: 'Dr. Michael Chen', specialization: 'Neurology' },
    { id: 'fallback-3', full_name: 'Dr. Emily Rodriguez', specialization: 'Pediatrics' },
    { id: 'fallback-4', full_name: 'Dr. James Wilson', specialization: 'Orthopedics' },
    { id: 'fallback-5', full_name: 'Dr. Priya Patel', specialization: 'Dermatology' },
  ];

  const handleBookAppointment = async () => {
    if (!appointmentData.doctor_id || !appointmentData.appointment_date || !appointmentData.appointment_time) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get or create patient record
      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      let patientId = patientData?.id;

      if (!patientId) {
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({
            user_id: user?.id,
            full_name: user?.email?.split('@')[0] || 'Patient',
            email: user?.email,
            phone: '',
            date_of_birth: new Date().toISOString().split('T')[0],
            gender: 'other',
          })
          .select('id')
          .single();

        patientId = newPatient.id;
      }

      // Use the selected doctor ID directly (all doctors are now from database)
      let doctorId = appointmentData.doctor_id;
      const selectedDoctor = doctors.find(d => d.id === appointmentData.doctor_id);

      // Check if using fallback doctor
      if (selectedDoctor && selectedDoctor.id.startsWith('fallback-')) {
        // For fallback doctors, try to find any real doctor in the database
        const { data: anyDoctor, error: anyDoctorError } = await supabase
          .from('doctors')
          .select('id, full_name, specialization')
          .limit(1)
          .maybeSingle();

        if (anyDoctor) {
          // Use the real doctor for the appointment
          doctorId = anyDoctor.id;
          console.log(`Using real doctor: ${anyDoctor.full_name} for appointment with ${selectedDoctor.full_name}`);
        } else {
          // No real doctors exist – create a DEMO appointment locally so the user can proceed
          const demoAppt = {
            id: `demo-${Date.now()}`,
            appointment_date: format(appointmentData.appointment_date!, 'yyyy-MM-dd'),
            appointment_time: appointmentData.appointment_time,
            reason: appointmentData.reason,
            status: 'confirmed',
            created_at: new Date().toISOString(),
            doctors: { full_name: selectedDoctor.full_name, specialization: selectedDoctor.specialization },
            patients: { full_name: user?.email?.split('@')[0] || 'Patient' },
          };
          saveDemoAppointment(demoAppt);

          toast({
            title: "Demo Appointment Booked",
            description: `Your demo appointment with ${selectedDoctor.full_name} has been scheduled for ${format(appointmentData.appointment_date!, 'PPP')} at ${appointmentData.appointment_time.substring(0, 5)}.`,
          });

          setIsDialogOpen(false);
          setAppointmentData({
            doctor_id: '',
            appointment_date: undefined,
            appointment_time: '',
            reason: ''
          });

          // Refresh lists (will include demo appointments)
          loadAppointments();
          fetchInsights();
          fetchRecentActivity();
          return;
        }
      }

      // Insert appointment into database
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: format(appointmentData.appointment_date!, 'yyyy-MM-dd'),
          appointment_time: appointmentData.appointment_time,
          reason: appointmentData.reason,
          status: 'confirmed',
          created_by: user?.id,
        });

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        toast({
          variant: "destructive",
          title: "Error",
          description: appointmentError.message,
        });
        return;
      }

      console.log('Appointment created successfully:', {
        patientId,
        doctorId,
        appointment_date: format(appointmentData.appointment_date!, 'yyyy-MM-dd'),
        appointment_time: appointmentData.appointment_time,
        reason: appointmentData.reason,
        status: 'scheduled'
        });

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${selectedDoctor?.full_name || 'the doctor'} has been successfully scheduled for ${format(appointmentData.appointment_date!, 'PPP')} at ${appointmentData.appointment_time.substring(0, 5)}.`,
      });

      setIsDialogOpen(false);
      setAppointmentData({
        doctor_id: '',
        appointment_date: undefined,
        appointment_time: '',
        reason: ''
      });
      
      fetchInsights();
      fetchRecentActivity();
      loadAppointments(); // Refresh appointments list
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDisplayName = () => {
    if (!userRole) return 'User';
    const roleNames = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      doctor: 'Doctor',
      patient: 'Patient',
      nurse: 'Nurse',
      receptionist: 'Receptionist'
    };
    return roleNames[userRole.role];
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const getRoleBasedContent = () => {
    if (!userRole) {
      return {
        title: "Welcome to MediDash Plus",
        description: "Your healthcare management platform",
        cards: []
      };
    }

    switch (userRole.role) {
      case 'patient':
        return {
          title: "Your Health Dashboard",
          description: "Track your appointments, records, and prescriptions",
          cards: [
            { icon: <Calendar className="h-6 w-6" />, title: "Upcoming Appointments", value: insights.upcomingAppointments, color: "bg-blue-500" },
            { icon: <FileText className="h-6 w-6" />, title: "Medical Records", value: insights.medicalRecords, color: "bg-green-500" },
            { icon: <Pill className="h-6 w-6" />, title: "Prescriptions", value: insights.prescriptions, color: "bg-purple-500" },
            { icon: <TrendingUp className="h-6 w-6" />, title: "Total Appointments", value: insights.totalAppointments, color: "bg-orange-500" },
          ]
        };
      
      case 'doctor':
        return {
          title: "Doctor Dashboard",
          description: "Manage your patients and appointments",
          cards: [
            { icon: <Clock className="h-6 w-6" />, title: "Today's Appointments", value: insights.todayAppointments, color: "bg-blue-500" },
            { icon: <Users className="h-6 w-6" />, title: "Total Patients", value: insights.totalPatients, color: "bg-green-500" },
            { icon: <CheckCircle className="h-6 w-6" />, title: "Completed", value: insights.completedAppointments, color: "bg-purple-500" },
            { icon: <FileText className="h-6 w-6" />, title: "Medical Records", value: insights.medicalRecords, color: "bg-orange-500" },
          ]
        };
      
      case 'nurse':
        return {
          title: "Nurse Dashboard",
          description: "Patient care and medication management",
          cards: [
            { icon: <ClipboardList className="h-6 w-6" />, title: "Active Patients", value: insights.totalPatients || 0, color: "bg-blue-500" },
            { icon: <Pill className="h-6 w-6" />, title: "Medications", value: insights.totalAppointments || 0, color: "bg-green-500" },
            { icon: <Bell className="h-6 w-6" />, title: "Alerts", value: insights.pendingAppointments || 0, color: "bg-red-500" },
            { icon: <CheckCircle className="h-6 w-6" />, title: "Completed Tasks", value: insights.completedAppointments || 0, color: "bg-purple-500" },
          ]
        };
      
      case 'receptionist':
        return {
          title: "Reception Dashboard",
          description: "Appointment scheduling and patient management",
          cards: [
            { icon: <Calendar className="h-6 w-6" />, title: "Total Appointments", value: insights.totalAppointments, color: "bg-blue-500" },
            { icon: <AlertCircle className="h-6 w-6" />, title: "Pending", value: insights.pendingAppointments, color: "bg-orange-500" },
            { icon: <Users className="h-6 w-6" />, title: "Total Patients", value: insights.totalPatients, color: "bg-green-500" },
            { icon: <Stethoscope className="h-6 w-6" />, title: "Active Doctors", value: insights.totalDoctors, color: "bg-purple-500" },
          ]
        };
      
      case 'admin':
        return {
          title: "Admin Dashboard",
          description: "Hospital operations and management",
          cards: [
            { icon: <Users className="h-6 w-6" />, title: "Total Patients", value: insights.totalPatients, color: "bg-blue-500" },
            { icon: <Stethoscope className="h-6 w-6" />, title: "Total Doctors", value: insights.totalDoctors, color: "bg-green-500" },
            { icon: <Calendar className="h-6 w-6" />, title: "All Appointments", value: insights.totalAppointments, color: "bg-purple-500" },
            { icon: <Award className="h-6 w-6" />, title: "Performance", value: "High", color: "bg-orange-500" },
          ]
        };
      
      case 'super_admin':
        return {
          title: "Super Admin Dashboard",
          description: "Complete system oversight and control",
          cards: [
            { icon: <Shield className="h-6 w-6" />, title: "System Status", value: "Active", color: "bg-blue-500" },
            { icon: <Users className="h-6 w-6" />, title: "Total Users", value: insights.totalPatients || 0, color: "bg-green-500" },
            { icon: <Activity className="h-6 w-6" />, title: "Operations", value: insights.totalAppointments || 0, color: "bg-purple-500" },
            { icon: <TrendingUp className="h-6 w-6" />, title: "Growth", value: "+25%", color: "bg-orange-500" },
          ]
        };
      
      default:
        return {
          title: "Welcome",
          description: "Your dashboard",
          cards: []
        };
    }
  };

  const AppointmentsList = () => {
    const [loading, setLoading] = useState(false);

    const handleAppointmentAction = async (appointmentId: string, action: 'approve' | 'reject') => {
      try {
        const newStatus = action === 'approve' ? 'confirmed' : 'cancelled';
        
        const { error } = await supabase
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appointmentId);

        if (error) {
          console.error('Error updating appointment:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update appointment status",
          });
          return;
        }

        toast({
          title: action === 'approve' ? "Appointment Confirmed" : "Appointment Cancelled",
          description: `Appointment has been ${action === 'approve' ? 'confirmed' : 'cancelled'}`,
        });

        // Refresh appointments list
        await loadAppointments();
      } catch (error) {
        console.error('Error updating appointment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update appointment status",
        });
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Appointments Found</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any appointments yet.
          </p>
          <Button onClick={() => setIsAppointmentsDialogOpen(false)}>
            Book an Appointment
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      {userRole?.role === 'patient' 
                        ? `Dr. ${appointment.doctors?.full_name || 'Unknown Doctor'}` 
                        : appointment.patients?.full_name || 'Unknown Patient'
                      }
                    </h4>
                    <Badge variant={
                      appointment.status === 'confirmed' ? 'default' :
                      appointment.status === 'completed' ? 'secondary' :
                      appointment.status === 'cancelled' ? 'destructive' :
                      appointment.status === 'no_show' ? 'destructive' : 'outline'
                    }>
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userRole?.role === 'patient' 
                      ? appointment.doctors?.specialization || 'General Practice'
                      : 'Patient'
                    }
                  </p>
                  <p className="text-sm">
                    {format(new Date(appointment.appointment_date), 'PPP')} at {appointment.appointment_time}
                  </p>
                  {appointment.reason && (
                    <p className="text-sm text-muted-foreground">
                      Reason: {appointment.reason}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Created: {format(new Date(appointment.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                  
                  {/* Approval buttons for doctors and admins */}
                  {(userRole?.role === 'doctor' || userRole?.role === 'admin' || userRole?.role === 'super_admin') && 
                   appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no_show' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirm
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const roleContent = getRoleBasedContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">MediDash Plus</h1>
            </div>
            
            <nav className="flex items-center gap-2 md:gap-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>
                      Select a doctor, date, and time for your appointment
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Doctor *</Label>
                      <Select
                        value={appointmentData.doctor_id}
                        onValueChange={(value) => setAppointmentData({ ...appointmentData, doctor_id: value })}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.full_name} - {doctor.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Calendar className="mr-2 h-4 w-4" />
                            {appointmentData.appointment_date ? (
                              format(appointmentData.appointment_date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={appointmentData.appointment_date}
                            onSelect={(date) => setAppointmentData({ ...appointmentData, appointment_date: date })}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Time *</Label>
                      <Select
                        value={appointmentData.appointment_time}
                        onValueChange={(value) => setAppointmentData({ ...appointmentData, appointment_time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00:00">09:00 AM</SelectItem>
                          <SelectItem value="09:30:00">09:30 AM</SelectItem>
                          <SelectItem value="10:00:00">10:00 AM</SelectItem>
                          <SelectItem value="10:30:00">10:30 AM</SelectItem>
                          <SelectItem value="11:00:00">11:00 AM</SelectItem>
                          <SelectItem value="11:30:00">11:30 AM</SelectItem>
                          <SelectItem value="12:00:00">12:00 PM</SelectItem>
                          <SelectItem value="12:30:00">12:30 PM</SelectItem>
                          <SelectItem value="13:00:00">01:00 PM</SelectItem>
                          <SelectItem value="13:30:00">01:30 PM</SelectItem>
                          <SelectItem value="14:00:00">02:00 PM</SelectItem>
                          <SelectItem value="14:30:00">02:30 PM</SelectItem>
                          <SelectItem value="15:00:00">03:00 PM</SelectItem>
                          <SelectItem value="15:30:00">03:30 PM</SelectItem>
                          <SelectItem value="16:00:00">04:00 PM</SelectItem>
                          <SelectItem value="16:30:00">04:30 PM</SelectItem>
                          <SelectItem value="17:00:00">05:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reason for Visit</Label>
                        <textarea
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Describe the reason..."
                        value={appointmentData.reason}
                        onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleBookAppointment} disabled={isSubmitting}>
                        {isSubmitting ? "Booking..." : "Book Appointment"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAppointmentsDialogOpen} onOpenChange={setIsAppointmentsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden md:inline">My Appointments</span>
                    <span className="md:hidden">Appointments</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>My Appointments</DialogTitle>
                    <DialogDescription>
                      View and manage your appointments
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <AppointmentsList />
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
                <HomeIcon className="h-4 w-4" />
                Dashboard
              </Button>
            </nav>

            <div className="flex items-center gap-4">
              <Button onClick={signOut} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.email}</p>
                      {userRole && <p className="text-xs text-muted-foreground">{getRoleDisplayName()}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsAppointmentsDialogOpen(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    My Appointments
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {roleContent.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {roleContent.description}
          </p>
        </div>

        {/* Stats Cards */}
        {roleContent.cards.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {roleContent.cards.map((card: any, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className={`${card.color} text-white rounded-full h-10 w-10 flex items-center justify-center`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest appointments and records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {userRole?.role === 'patient' 
                              ? `Appointment with Dr. ${activity.doctors?.full_name || 'Unknown'}`
                              : userRole?.role === 'doctor'
                              ? `Appointment with ${activity.patients?.full_name || 'Patient'}`
                              : `Appointment: ${activity.patients?.full_name || 'Patient'} - Dr. ${activity.doctors?.full_name || 'Unknown'}`
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(activity.appointment_date), "MMMM d, yyyy")} at {activity.appointment_time}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                        activity.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        activity.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        {userRole?.role === 'patient' && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsDialogOpen(true)}>
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-1">Book Appointment</h3>
                  <p className="text-sm text-muted-foreground">Schedule your next visit</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-1">View Records</h3>
                  <p className="text-sm text-muted-foreground">Medical history & documents</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-500 text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                    <Pill className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-1">Prescriptions</h3>
                  <p className="text-sm text-muted-foreground">View medications</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsDialogOpen(true)}>
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-500 text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-1">Find Doctor</h3>
                  <p className="text-sm text-muted-foreground">Browse specialists</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold mb-6 text-center">About MediDash Plus</h3>
          <Card>
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
                MediDash Plus is a comprehensive hospital management system designed to streamline healthcare operations 
                and provide seamless patient care. Our platform integrates modern technology with medical expertise to 
                deliver efficient, secure, and user-friendly healthcare solutions for hospitals, clinics, and medical facilities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hospital Features Section */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold mb-8 text-center">Hospital Features & Facilities</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Activity className="h-8 w-8" />}
              title="Electronic Health Records"
              description="Complete digital transformation of patient records with real-time access and secure storage."
              color="bg-blue-100"
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Smart Scheduling System"
              description="Intelligent appointment booking with automated reminders and calendar integration."
              color="bg-green-100"
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Digital Prescriptions"
              description="Paperless prescription management with e-signature and pharmacy integration."
              color="bg-purple-100"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Patient Portal"
              description="Self-service portal for patients to view records, book appointments, and track health."
              color="bg-orange-100"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Analytics & Reports"
              description="Comprehensive analytics dashboard with insights into hospital performance and trends."
              color="bg-pink-100"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Multi-Level Security"
              description="Advanced security protocols with role-based access control and HIPAA compliance."
              color="bg-red-100"
            />
            <FeatureCard
              icon={<Heart className="h-8 w-8" />}
              title="24/7 Emergency Services"
              description="Round-the-clock emergency department with immediate triage and care protocols."
              color="bg-yellow-100"
            />
            <FeatureCard
              icon={<Stethoscope className="h-8 w-8" />}
              title="Specialty Departments"
              description="Multiple specialty clinics including cardiology, orthopedics, pediatrics, and more."
              color="bg-cyan-100"
            />
            <FeatureCard
              icon={<Building2 className="h-8 w-8" />}
              title="State-of-the-Art Facility"
              description="Modern infrastructure with advanced medical equipment and comfortable patient rooms."
              color="bg-indigo-100"
            />
            <FeatureCard
              icon={<Pill className="h-8 w-8" />}
              title="Pharmacy Integration"
              description="In-house pharmacy with automated medication dispensing and inventory management."
              color="bg-teal-100"
            />
            <FeatureCard
              icon={<Eye className="h-8 w-8" />}
              title="Telemedicine Support"
              description="Virtual consultations and remote monitoring capabilities for enhanced accessibility."
              color="bg-emerald-100"
            />
            <FeatureCard
              icon={<ClipboardList className="h-8 w-8" />}
              title="Laboratory Services"
              description="Fully equipped lab with rapid testing, blood work, and diagnostic imaging."
              color="bg-rose-100"
            />
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold mb-8 text-center">Why Choose MediDash Plus</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
        </div>
                  <CardTitle>Proven Excellence</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trusted by leading healthcare institutions, MediDash Plus delivers reliable solutions backed by 
                  years of expertise in healthcare technology and continuous innovation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
        </div>
                  <CardTitle>Real-Time Access</CardTitle>
    </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access patient information, schedules, and reports instantly from any device, ensuring 
                  seamless coordination across all healthcare teams and departments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
    <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Patient-Centered</CardTitle>
                </div>
    </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Empowering patients with tools to actively participate in their healthcare journey through 
                  easy appointment booking, health record access, and transparent communication.
                </p>
              </CardContent>
  </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-primary" />
      </div>
                  <CardTitle>Scalable Solutions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built to grow with your institution, our system adapts to your needs whether you're a small 
                  clinic or a multi-facility hospital network.
                </p>
    </CardContent>
  </Card>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Hospital Statistics</CardTitle>
              <CardDescription className="text-center">Leading healthcare delivery metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Expert Medical Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Medical Specialties</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">98%</div>
                  <div className="text-sm text-muted-foreground">Patient Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">15+</div>
                  <div className="text-sm text-muted-foreground">Years of Excellence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hospital Info */}
  <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hospital Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Clock className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">Working Hours</h4>
                <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-sm text-muted-foreground">Saturday - Sunday: 10:00 AM - 4:00 PM</p>
              </div>
              <div>
                <Heart className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">Emergency</h4>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
                <p className="text-sm text-muted-foreground">Call: +1 (555) 123-4567</p>
              </div>
              <div>
                <Shield className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">Security</h4>
                <p className="text-sm text-muted-foreground">Your data is protected</p>
                <p className="text-sm text-muted-foreground">HIPAA compliant</p>
              </div>
        </div>
    </CardContent>
  </Card>
      </main>

      <footer className="border-t py-8 bg-card/50 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 MediDash Plus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
    <CardHeader>
      <div className={`${color} text-primary rounded-lg h-16 w-16 flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription className="text-sm">{description}</CardDescription>
    </CardHeader>
  </Card>
);

export default Home;