import { useState, useEffect } from "react";
import { Search, Plus, Users, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PatientCard from "@/components/PatientCard";
import PatientModal from "@/components/PatientModal";
import AddPatientForm from "@/components/AddPatientForm";
import { Patient } from "@/types/patient";
import { useToast } from "@/hooks/use-toast";

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Map JSONPlaceholder user to Patient type while preserving existing UI needs
  const mapUserToPatient = (user: any): Patient => {
    const fullAddress = user?.address
      ? `${user.address.street}, ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}`
      : "";
    const randomAge =  twentyToSeventy(user?.id);
    const gender = (user?.id ?? 0) % 2 === 0 ? "male" : "female";
    const lastVisit = randomRecentDate(user?.id);

    return {
      id: user.id,
      name: user.name,
      age: randomAge,
      contact: user.phone ?? "",
      email: user.email ?? "",
      address: fullAddress,
      gender,
      bloodType: undefined,
      emergencyContact: user.phone ? `Primary EC - ${user.phone}` : undefined,
      medicalHistory: "No significant medical history on file.",
      lastVisit,
    };
  };

  // Stable pseudo-random helpers based on id for consistent UI
  const twentyToSeventy = (seed: number = 1) => 20 + ((seed * 37) % 51);
  const randomRecentDate = (seed: number = 1) => {
    const daysAgo = (seed * 13) % 28;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  // Mock patient data with medical information
  const mockPatients: Patient[] = [
    {
      id: 1,
      name: "John Smith",
      age: 45,
      contact: "+1 (555) 0123",
      email: "john.smith@email.com",
      address: "123 Main St, Springfield, IL 62701",
      gender: "male",
      bloodType: "A+",
      emergencyContact: "Jane Smith - Wife - +1 (555) 0124",
      medicalHistory: "Hypertension, managed with medication. Regular checkups every 6 months.",
      lastVisit: "2024-01-15"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      age: 32,
      contact: "+1 (555) 0456",
      email: "sarah.johnson@email.com",
      address: "456 Oak Ave, Chicago, IL 60601",
      gender: "female",
      bloodType: "O-",
      emergencyContact: "Mike Johnson - Husband - +1 (555) 0457",
      medicalHistory: "Allergic to penicillin. Previous surgery: Appendectomy (2019)",
      lastVisit: "2024-01-22"
    },
    {
      id: 3,
      name: "Michael Brown",
      age: 67,
      contact: "+1 (555) 0789",
      email: "michael.brown@email.com",
      address: "789 Pine Rd, Milwaukee, WI 53201",
      gender: "male",
      bloodType: "B+",
      emergencyContact: "Lisa Brown - Daughter - +1 (555) 0790",
      medicalHistory: "Type 2 diabetes, managed with diet and medication. Regular eye exams.",
      lastVisit: "2024-01-10"
    },
    {
      id: 4,
      name: "Emily Davis",
      age: 28,
      contact: "+1 (555) 1012",
      email: "emily.davis@email.com",
      address: "321 Elm St, Detroit, MI 48201",
      gender: "female",
      bloodType: "AB+",
      emergencyContact: "Tom Davis - Brother - +1 (555) 1013",
      medicalHistory: "No significant medical history. Annual wellness checkups.",
      lastVisit: "2024-01-18"
    },
    {
      id: 5,
      name: "Robert Wilson",
      age: 54,
      contact: "+1 (555) 1314",
      email: "robert.wilson@email.com",
      address: "654 Maple Dr, Columbus, OH 43201",
      gender: "male",
      bloodType: "O+",
      emergencyContact: "Helen Wilson - Wife - +1 (555) 1315",
      medicalHistory: "History of heart disease. Takes medication for cholesterol.",
      lastVisit: "2024-01-25"
    },
    {
      id: 6,
      name: "Jennifer Lee",
      age: 41,
      contact: "+1 (555) 1516",
      email: "jennifer.lee@email.com",
      address: "987 Cedar Ln, Nashville, TN 37201",
      gender: "female",
      bloodType: "A-",
      emergencyContact: "David Lee - Husband - +1 (555) 1517",
      medicalHistory: "Asthma, uses inhaler as needed. No other significant conditions.",
      lastVisit: "2024-01-12"
    }
  ];

  // Fetch from public API with graceful fallback to mock data
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Small UX delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const users = await response.json();
        const mapped: Patient[] = (users as any[]).map(mapUserToPatient);

        setPatients(mapped);
        setFilteredPatients(mapped);
        toast({
          title: "Patients Loaded",
          description: `Loaded ${mapped.length} patient records from public API.`,
        });
      } catch (err) {
        // Fallback to local mock data to keep UI functional
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
        setError(null);
        toast({
          title: "Using Fallback Data",
          description: "Public API unavailable. Loaded local sample patients instead.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [toast]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  // Listen for add patient event from navigation
  useEffect(() => {
    const handleOpenAddPatient = () => setIsAddPatientOpen(true);
    
    window.addEventListener('openAddPatient', handleOpenAddPatient);
    return () => window.removeEventListener('openAddPatient', handleOpenAddPatient);
  }, []);

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);
  };

  const handleAddPatient = (newPatientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...newPatientData,
      id: Math.max(...patients.map(p => p.id), 0) + 1
    };
    
    setPatients(prev => [newPatient, ...prev]);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Patient Records</h2>
          <p className="text-muted-foreground">Please wait while we fetch the latest patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Patients</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Patient Records</h1>
            <p className="text-muted-foreground">
              Manage and view all patient information in one place
            </p>
          </div>
          <Button onClick={() => setIsAddPatientOpen(true)} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">Active patient records</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Visits</CardTitle>
              <Badge variant="secondary">This Month</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.filter(p => p.lastVisit).length}</div>
              <p className="text-xs text-muted-foreground">Patients with recent visits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPatients.length}</div>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? `Matching "${searchQuery}"` : "All patients"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patient Grid */}
        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Patients Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No patients match your search for "${searchQuery}"`
                : "No patients have been added yet"
              }
            </p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            ) : (
              <Button onClick={() => setIsAddPatientOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <PatientModal
        patient={selectedPatient}
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setSelectedPatient(null);
        }}
      />
      
      <AddPatientForm
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
};

export default Patients;