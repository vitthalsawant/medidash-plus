import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Input } from "@/components/ui/input";
import { Calendar, UserPlus, Clock, Phone, Users, CheckCircle, AlertCircle, Activity, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const ReceptionistDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [appointmentData, setAppointmentData] = useState({
    patient_id: '',
    doctor_id: '',
    patient_name: '',
    appointment_date: undefined as Date | undefined,
    appointment_time: '',
    reason: ''
  });

  useEffect(() => {
    if (isDialogOpen) {
      fetchDoctors();
      fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email')
        .limit(50)
        .order('full_name');
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleBookAppointment = async () => {
    if (!appointmentData.patient_id || !appointmentData.doctor_id || !appointmentData.appointment_date || !appointmentData.appointment_time) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: appointmentData.patient_id,
          doctor_id: appointmentData.doctor_id,
          appointment_date: format(appointmentData.appointment_date!, 'yyyy-MM-dd'),
          appointment_time: appointmentData.appointment_time,
          reason: appointmentData.reason,
          status: 'pending',
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Appointment Booked!",
        description: "The appointment has been successfully scheduled.",
      });

      setIsDialogOpen(false);
      setAppointmentData({
        patient_id: '',
        doctor_id: '',
        patient_name: '',
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

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="default">
                      <Plus className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Book Appointment for Patient</DialogTitle>
                      <DialogDescription>
                        Schedule an appointment between a patient and doctor
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      {/* Patient Selection with Search */}
                      <div className="space-y-2">
                        <Label>Select Patient *</Label>
                        <Input
                          placeholder="Search patients..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="mb-2"
                        />
                        <Select
                          value={appointmentData.patient_id}
                          onValueChange={(value) => {
                            const selectedPatient = patients.find(p => p.id === value);
                            setAppointmentData({ 
                              ...appointmentData, 
                              patient_id: value,
                              patient_name: selectedPatient?.full_name || ''
                            });
                          }}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredPatients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.full_name} ({patient.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Doctor Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Select Doctor *</Label>
                        <Select
                          value={appointmentData.doctor_id}
                          onValueChange={(value) => setAppointmentData({ ...appointmentData, doctor_id: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="doctor">
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

                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label>Select Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={isSubmitting}
                            >
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Time Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="time">Select Time *</Label>
                        <Select
                          value={appointmentData.appointment_time}
                          onValueChange={(value) => setAppointmentData({ ...appointmentData, appointment_time: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="time">
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

                      {/* Reason */}
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Visit</Label>
                        <Textarea
                          id="reason"
                          placeholder="Describe the reason for the appointment..."
                          value={appointmentData.reason}
                          onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
                          disabled={isSubmitting}
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleBookAppointment}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Booking..." : "Book Appointment"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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

