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
import { Users, Calendar, FileText, Clipboard, Stethoscope, Clock, Activity, Pill, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const DoctorDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [prescriptionData, setPrescriptionData] = useState({
    patient_id: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    instructions: ''
  });

  useEffect(() => {
    if (isDialogOpen) {
      fetchPatients();
    }
  }, [isDialogOpen]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email')
        .order('full_name')
        .limit(50);
      
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

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleCreatePrescription = async () => {
    if (!prescriptionData.patient_id || !prescriptionData.diagnosis) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (medications.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all medication details",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get doctor ID
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!doctorData) {
        throw new Error('Doctor profile not found');
      }

      // Create medical record first
      const { data: recordData, error: recordError } = await supabase
        .from('medical_records')
        .insert({
          patient_id: prescriptionData.patient_id,
          doctor_id: doctorData.id,
          diagnosis: prescriptionData.diagnosis,
          symptoms: prescriptionData.symptoms,
          treatment: prescriptionData.treatment,
        })
        .select('id')
        .single();

      if (recordError) throw recordError;

      // Create prescription
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: prescriptionData.patient_id,
          doctor_id: doctorData.id,
          medical_record_id: recordData.id,
          medications: medications,
          instructions: prescriptionData.instructions,
          valid_until: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        });

      if (prescriptionError) throw prescriptionError;

      toast({
        title: "Prescription Created!",
        description: "The prescription has been successfully created.",
      });

      setIsDialogOpen(false);
      setPrescriptionData({
        patient_id: '',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        instructions: ''
      });
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
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
            <h2 className="text-3xl font-bold">Doctor Dashboard</h2>
            <p className="text-muted-foreground">Patient records, appointments, and prescriptions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="My Patients" value="142" change="Assigned" icon={<Users className="h-5 w-5" />} />
            <StatsCard title="Today's Appointments" value="8" change="Next in 15 mins" icon={<Calendar className="h-5 w-5" />} />
            <StatsCard title="Prescriptions" value="234" change="This month" icon={<Pill className="h-5 w-5" />} />
            <StatsCard title="Pending Reviews" value="12" change="Action needed" icon={<FileText className="h-5 w-5" />} />
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
                <Button className="w-full" variant="default">View All Patients</Button>
                <Button className="w-full" variant="outline">Search Patient</Button>
                <Button className="w-full" variant="outline">Recent Visits</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
                <CardDescription>Manage your schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">Today's Schedule</Button>
                <Button className="w-full" variant="outline">Upcoming Appointments</Button>
                <Button className="w-full" variant="outline">Set Availability</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescriptions
                </CardTitle>
                <CardDescription>Create and manage prescriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="default">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Prescription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Prescription</DialogTitle>
                      <DialogDescription>
                        Prescribe medications and treatments for your patient
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      {/* Patient Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="patient">Select Patient *</Label>
                        <Select
                          value={prescriptionData.patient_id}
                          onValueChange={(value) => setPrescriptionData({ ...prescriptionData, patient_id: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="patient">
                            <SelectValue placeholder="Choose a patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.full_name} ({patient.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Diagnosis */}
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnosis *</Label>
                        <Input
                          id="diagnosis"
                          placeholder="Enter diagnosis..."
                          value={prescriptionData.diagnosis}
                          onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Symptoms */}
                      <div className="space-y-2">
                        <Label htmlFor="symptoms">Symptoms</Label>
                        <Textarea
                          id="symptoms"
                          placeholder="Describe patient symptoms..."
                          value={prescriptionData.symptoms}
                          onChange={(e) => setPrescriptionData({ ...prescriptionData, symptoms: e.target.value })}
                          disabled={isSubmitting}
                          rows={3}
                        />
                      </div>

                      {/* Treatment */}
                      <div className="space-y-2">
                        <Label htmlFor="treatment">Treatment</Label>
                        <Textarea
                          id="treatment"
                          placeholder="Describe treatment plan..."
                          value={prescriptionData.treatment}
                          onChange={(e) => setPrescriptionData({ ...prescriptionData, treatment: e.target.value })}
                          disabled={isSubmitting}
                          rows={3}
                        />
                      </div>

                      {/* Medications */}
                      <div className="space-y-2">
                        <Label>Medications</Label>
                        {medications.map((med, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md">
                            <Input
                              placeholder="Medication name"
                              value={med.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                              disabled={isSubmitting}
                              className="col-span-3"
                            />
                            <Input
                              placeholder="Dosage"
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              disabled={isSubmitting}
                              className="col-span-2"
                            />
                            <Input
                              placeholder="Frequency"
                              value={med.frequency}
                              onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                              disabled={isSubmitting}
                              className="col-span-2"
                            />
                            <Input
                              placeholder="Duration"
                              value={med.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                              disabled={isSubmitting}
                              className="col-span-3"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedication(index)}
                              disabled={isSubmitting || medications.length === 1}
                              className="col-span-1"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addMedication}
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Medication
                        </Button>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          placeholder="Additional instructions for the patient..."
                          value={prescriptionData.instructions}
                          onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
                          disabled={isSubmitting}
                          rows={3}
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
                          onClick={handleCreatePrescription}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Creating..." : "Create Prescription"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button className="w-full" variant="outline">View Recent</Button>
                <Button className="w-full" variant="outline">Upload Reports</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Today's schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AppointmentItem time="09:00 AM" patient="John Smith" reason="Follow-up" />
                  <AppointmentItem time="10:30 AM" patient="Emma Wilson" reason="Consultation" />
                  <AppointmentItem time="02:00 PM" patient="Robert Brown" reason="Checkup" />
                  <AppointmentItem time="04:15 PM" patient="Lisa Anderson" reason="Review" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Prescriptions</CardTitle>
                <CardDescription>Latest prescriptions issued</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PrescriptionItem patient="John Smith" date="2 hours ago" status="Active" />
                  <PrescriptionItem patient="Emma Wilson" date="5 hours ago" status="Active" />
                  <PrescriptionItem patient="Michael Davis" date="Yesterday" status="Completed" />
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

const AppointmentItem = ({ time, patient, reason }: any) => (
  <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <div className="flex-shrink-0">
      <Clock className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{patient}</p>
      <p className="text-xs text-muted-foreground">{reason}</p>
    </div>
    <span className="text-sm font-medium">{time}</span>
  </div>
);

const PrescriptionItem = ({ patient, date, status }: any) => (
  <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
    <div>
      <p className="text-sm font-medium">{patient}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
    <Button size="sm" variant="ghost">{status}</Button>
  </div>
);

export default DoctorDashboard;

