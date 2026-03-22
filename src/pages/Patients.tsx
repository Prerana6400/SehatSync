import { useMemo, useState, useEffect } from "react";
import { Plus, Users, Loader } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientCard from "@/components/PatientCard";
import PatientModal from "@/components/PatientModal";
import { PatientFormModal } from "@/components/PatientFormModal";
import { SearchBar } from "@/components/SearchBar";
import type { Patient } from "@/types/patient";
import { apiFetch } from "@/lib/api";

const Patients = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editPatient, setEditPatient] = useState<Patient | null>(null);

  const {
    data: patients = [],
    isLoading: patientsLoading,
    isError: patientsError,
    error: patientsErrorObj,
    refetch: refetchPatients,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => apiFetch<Patient[]>("/api/patients"),
  });

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const qRaw = searchQuery.trim();
    if (!q) return patients;
    return patients.filter((patient) => {
      if (patient.name.toLowerCase().includes(q)) return true;
      if (patient.contact.replace(/\s/g, "").includes(qRaw.replace(/\s/g, ""))) return true;
      if (String(patient.id).includes(qRaw) || String(patient.id) === qRaw) return true;
      return false;
    });
  }, [searchQuery, patients]);

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) {
      const id = Number.parseInt(openId, 10);
      if (!Number.isNaN(id)) {
        setSelectedPatientId(id);
        setIsPatientModalOpen(true);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const st = location.state as { openAdd?: boolean } | null;
    if (st?.openAdd) {
      setFormMode("add");
      setEditPatient(null);
      setFormOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setIsPatientModalOpen(true);
  };

  const handleClosePatientModal = () => {
    setIsPatientModalOpen(false);
    setSelectedPatientId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("open");
      return next;
    });
  };

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditPatient(null);
    setFormOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setFormMode("edit");
    setEditPatient(patient);
    setFormOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<Patient, "id" | "visits" | "visitCount"> & { id?: number }
  ) => {
    if (data.id != null) {
      const { id, ...rest } = data;
      await apiFetch(`/api/patients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...rest,
          allergies: rest.allergies || undefined,
        }),
      });
    } else {
      await apiFetch("/api/patients", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          allergies: data.allergies || undefined,
        }),
      });
    }
    await queryClient.invalidateQueries({ queryKey: ["patients"] });
    await queryClient.invalidateQueries({ queryKey: ["analytics", "overview"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    await queryClient.invalidateQueries({ queryKey: ["alerts", "overview"] });
  };

  if (patientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading patient records</h2>
          <p className="text-muted-foreground">Fetching the latest patient data…</p>
        </div>
      </div>
    );
  }

  if (patientsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to load patients</h2>
          <p className="text-muted-foreground mb-4">
            {patientsErrorObj instanceof Error ? patientsErrorObj.message : "Something went wrong"}
          </p>
          <Button onClick={() => void refetchPatients()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Patient records</h1>
            <p className="text-muted-foreground">
              Search by name, patient ID, or phone. Cards show MRN, demographics, and last visit.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add patient
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">Active records</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matching search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPatients.length}</div>
              <p className="text-xs text-muted-foreground">
                {searchQuery.trim() ? `Filter: "${searchQuery.trim()}"` : "All patients"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick link</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/analytics">Patient analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, patient ID, or phone…"
          className="mb-8"
        />

        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery.trim()
                ? `No patients match "${searchQuery.trim()}"`
                : "No patients have been added yet"}
            </p>
            {searchQuery.trim() ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            ) : (
              <Button onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add first patient
              </Button>
            )}
          </div>
        )}
      </div>

      <PatientModal
        patientId={selectedPatientId}
        isOpen={isPatientModalOpen}
        onClose={handleClosePatientModal}
      />

      <PatientFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditPatient(null);
        }}
        mode={formMode}
        initialPatient={formMode === "edit" ? editPatient : null}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Patients;
