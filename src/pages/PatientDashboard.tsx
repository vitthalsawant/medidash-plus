import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar, FileText, Download, Clock, Heart, Activity, Pill, User, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const PatientDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const [appointmentData, setAppointmentData] = useState({
    doctor_id: '',
    appointment_date: undefined as Date | undefined,
    appointment_time: '',
    reason: ''
  });

  // Fetch available doctors
  useEffect(() => {
    if (isDialogOpen) {
      fetchDoctors();
    }
  }, [isDialogOpen]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialization, qualification, consultation_fee')
        .order('full_name');
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleBookAppointment = async () => {
    // Validate form
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
      // First, get or create patient record
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      let patientId = patientData?.id;

      // If patient doesn't exist, create one
      if (!patientId) {
        const { data: newPatient, error: createError } = await supabase
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

        if (createError) throw createError;
        patientId = newPatient.id;
      }

      // Create appointment
      const { error: appointmentError } = await supabase
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

      if (appointmentError) throw appointmentError;

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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="default">
                      <Plus className="mr-2 h-4 w-4" />
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
                      {/* Doctor Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Select Doctor *</Label>
                        <Select
                          value={appointmentData.doctor_id}
                          onValueChange={(value) => setAppointmentData({ ...appointmentData, doctor_id: value })}
                          disabled={isSubmitting || loadingDoctors}
                        >
                          <SelectTrigger id="doctor">
                            <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Choose a doctor"} />
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
                          placeholder="Describe the reason for your appointment..."
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

