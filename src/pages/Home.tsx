import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Shield, Clock, TrendingUp, Award, Home as HomeIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (isDialogOpen) {
      fetchDoctors();
    }
  }, [isDialogOpen]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialization')
        .order('full_name');
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

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

      await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          doctor_id: appointmentData.doctor_id,
          appointment_date: format(appointmentData.appointment_date!, 'yyyy-MM-dd'),
          appointment_time: appointmentData.appointment_time,
          reason: appointmentData.reason,
          status: 'scheduled',
          created_by: user?.id,
        });

      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled.",
      });

      setIsDialogOpen(false);
      setAppointmentData({
        doctor_id: '',
        appointment_date: undefined,
        appointment_time: '',
        reason: ''
      });
    } catch (error: any) {
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
    if (!userRole) return '';
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
            
            <nav className="hidden md:flex items-center gap-6">
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
                      <Textarea
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
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to MediDash Plus
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your modern healthcare management platform with state-of-the-art infrastructure
          </p>
        </div>

        {/* New Infrastructure Cards */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center">New Infrastructure & Facilities</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfrastructureCard
              icon={<Building2 className="h-12 w-12" />}
              title="New Medical Wing"
              description="State-of-the-art facilities with advanced medical equipment and modern patient rooms."
              color="text-blue-600"
            />
            <InfrastructureCard
              icon={<Stethoscope className="h-12 w-12" />}
              title="Advanced Diagnostics"
              description="Cutting-edge diagnostic equipment including MRI, CT scans, and laboratory services."
              color="text-green-600"
            />
            <InfrastructureCard
              icon={<Heart className="h-12 w-12" />}
              title="Cardiac Care Unit"
              description="Dedicated cardiac care center with 24/7 monitoring and emergency response."
              color="text-red-600"
            />
            <InfrastructureCard
              icon={<Shield className="h-12 w-12" />}
              title="Enhanced Security"
              description="Modern security systems with digital access control and visitor management."
              color="text-purple-600"
            />
            <InfrastructureCard
              icon={<Clock className="h-12 w-12" />}
              title="24/7 Emergency Services"
              description="Round-the-clock emergency department with immediate response capabilities."
              color="text-orange-600"
            />
            <InfrastructureCard
              icon={<TrendingUp className="h-12 w-12" />}
              title="Digital Health Records"
              description="Completely paperless system with cloud-based patient records management."
              color="text-cyan-600"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <ActionCard
              icon={<Calendar className="h-8 w-8" />}
              title="Book Appointment"
              description="Schedule your next visit"
              onClick={() => setIsDialogOpen(true)}
              color="bg-blue-500"
            />
            <ActionCard
              icon={<FileText className="h-8 w-8" />}
              title="My Records"
              description="View medical history"
              onClick={() => navigate('/dashboard')}
              color="bg-green-500"
            />
            <ActionCard
              icon={<Pill className="h-8 w-8" />}
              title="Prescriptions"
              description="Manage medications"
              onClick={() => navigate('/dashboard')}
              color="bg-purple-500"
            />
            <ActionCard
              icon={<Users className="h-8 w-8" />}
              title="Find Doctor"
              description="Browse specialists"
              onClick={() => setIsDialogOpen(true)}
              color="bg-orange-500"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <StatCard number="500+" label="Expert Doctors" />
          <StatCard number="10K+" label="Happy Patients" />
          <StatCard number="50+" label="Specialties" />
          <StatCard number="24/7" label="Emergency Care" />
        </div>
      </main>

      <footer className="border-t py-8 bg-card/50 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 MediDash Plus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const InfrastructureCard = ({ icon, title, description, color }: any) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className={`${color} mb-2`}>{icon}</div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

const ActionCard = ({ icon, title, description, onClick, color }: any) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
    <CardContent className="p-6 text-center">
      <div className={`${color} text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const StatCard = ({ number, label }: any) => (
  <Card>
    <CardContent className="p-6 text-center">
      <div className="text-3xl font-bold text-primary mb-2">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </CardContent>
  </Card>
);

export default Home;

