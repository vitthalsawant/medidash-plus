import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Stethoscope, Building2, Heart, Shield, TrendingUp } from "lucide-react";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  available_hours: string;
}

interface PatientRecord {
  id: string;
}

export default function Home() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
    if (user && userRole?.role === 'patient') {
      fetchPatientRecord();
    }
  }, [user, userRole]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('full_name');
    
    if (data && !error) {
      setDoctors(data);
    }
  };

  const fetchPatientRecord = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data && !error) {
      setPatientRecord(data);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to book an appointment.",
      });
      navigate('/auth');
      return;
    }

    if (!patientRecord) {
      toast({
        variant: "destructive",
        title: "Patient record required",
        description: "Please complete your patient registration first.",
      });
      return;
    }

    if (!selectedDoctor || !appointmentDate || !appointmentTime || !reason) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: patientRecord.id,
          doctor_id: selectedDoctor,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason: reason,
          notes: notes,
          status: 'pending',
          created_by: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Appointment requested!",
        description: "Your appointment request has been submitted for approval.",
      });

      // Reset form
      setSelectedDoctor("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
      setNotes("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error booking appointment",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to MediDash Plus
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive healthcare management platform. Book appointments with our expert doctors.
          </p>
        </div>

        {/* New Infrastructure Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Modern Healthcare Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>New Medical Wing</CardTitle>
                <CardDescription>State-of-the-art facilities with advanced medical equipment</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Cardiac Care Unit</CardTitle>
                <CardDescription>Dedicated cardiac center with 24/7 monitoring</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Enhanced Security</CardTitle>
                <CardDescription>Modern security with digital access control</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Appointment Booking Section */}
        {(!user || userRole?.role === 'patient') && (
          <Card className="max-w-2xl mx-auto mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book an Appointment
              </CardTitle>
              <CardDescription>
                Select a doctor and choose your preferred appointment time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor *</Label>
                  <select
                    id="doctor"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.full_name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit *</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Regular checkup, Consultation"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Our Doctors Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Expert Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dr. {doctor.full_name}</CardTitle>
                      <CardDescription>{doctor.specialization}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Qualification:</strong> {doctor.qualification}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Experience:</strong> {doctor.experience_years} years
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Consultation Fee:</strong> ${doctor.consultation_fee}
                  </p>
                  {doctor.available_days && doctor.available_days.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Available:</strong> {doctor.available_days.join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links for Staff */}
        {user && userRole?.role !== 'patient' && (
          <div className="mt-12 text-center">
            <Button onClick={() => navigate('/dashboard')} size="lg">
              Go to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
