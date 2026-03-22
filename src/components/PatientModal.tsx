import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Users,
  Stethoscope,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { PatientDetail } from "@/types/patient";
import { apiFetch } from "@/lib/api";
import { formatMrn, formatVisitDate, formatRelativeFromDate } from "@/lib/format";

interface PatientModalProps {
  patientId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const PatientModal = ({ patientId, isOpen, onClose }: PatientModalProps) => {
  const queryClient = useQueryClient();
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [providerLabel, setProviderLabel] = useState("");

  const {
    data: patient,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => apiFetch<PatientDetail>(`/api/patients/${patientId}`),
    enabled: isOpen && patientId != null,
  });

  const addVisit = useMutation({
    mutationFn: (body: {
      visitDate: string;
      chiefComplaint: string;
      diagnosis?: string;
      clinicalNotes?: string;
      providerLabel?: string;
    }) =>
      apiFetch(`/api/patients/${patientId}/visits`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      setChiefComplaint("");
      setDiagnosis("");
      setClinicalNotes("");
      setProviderLabel("");
      setVisitDate(new Date().toISOString().slice(0, 10));
    },
  });

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !chiefComplaint.trim()) return;
    addVisit.mutate({
      visitDate,
      chiefComplaint: chiefComplaint.trim(),
      diagnosis: diagnosis.trim() || undefined,
      clinicalNotes: clinicalNotes.trim() || undefined,
      providerLabel: providerLabel.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {isError && !isLoading && (
          <p className="text-sm text-destructive py-4">
            {error instanceof Error ? error.message : "Could not load chart."}
          </p>
        )}

        {!isLoading && patient && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xl">
                <span className="flex items-center gap-2">
                  <User className="h-6 w-6 text-primary shrink-0" />
                  {patient.name}
                </span>
                <Badge variant="outline" className="text-xs font-mono w-fit">
                  {formatMrn(patient.id)}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Demographics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Age</Badge>
                      <span>{patient.age} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Gender</Badge>
                      <span className="capitalize">{patient.gender}</span>
                    </div>
                    {patient.bloodType && (
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Blood: {patient.bloodType}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {patient.contact}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {patient.email}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{patient.address || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {patient.allergies && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Allergies & alerts
                  </h3>
                  <p className="text-sm">{patient.allergies}</p>
                </div>
              )}

              {patient.emergencyContact && (
                <div>
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Emergency contact
                  </h3>
                  <p className="text-sm bg-secondary p-3 rounded-lg">{patient.emergencyContact}</p>
                </div>
              )}

              {(patient.primaryCondition || patient.assignedDoctor) && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <h3 className="font-semibold text-primary">Care team</h3>
                  {patient.primaryCondition && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Primary condition: </span>
                      {patient.primaryCondition}
                    </p>
                  )}
                  {patient.assignedDoctor && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Assigned doctor: </span>
                      {patient.assignedDoctor}
                    </p>
                  )}
                </div>
              )}

              {patient.medicalHistory && (
                <div>
                  <h3 className="font-semibold text-primary mb-2">Problem list / history</h3>
                  <p className="text-sm bg-muted/50 p-4 rounded-lg border-l-4 border-l-primary">
                    {patient.medicalHistory}
                  </p>
                </div>
              )}

              {patient.lastVisit && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last encounter on file:{" "}
                  <span className="font-medium text-foreground">
                    {formatVisitDate(patient.lastVisit)}
                  </span>{" "}
                  ({formatRelativeFromDate(patient.lastVisit)})
                </p>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Encounters ({patient.visits?.length ?? 0})
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {patient.visits && patient.visits.length > 0 ? (
                    patient.visits.map((v) => (
                      <div
                        key={v.id}
                        className="rounded-md border p-3 text-sm space-y-1 bg-card"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-medium">{formatVisitDate(v.visitDate)}</span>
                          {v.providerLabel && (
                            <span className="text-xs text-muted-foreground text-right">
                              {v.providerLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-foreground">{v.chiefComplaint}</p>
                        {v.diagnosis && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Dx:</span> {v.diagnosis}
                          </p>
                        )}
                        {v.clinicalNotes && (
                          <p className="text-muted-foreground text-xs border-t pt-2 mt-1">
                            {v.clinicalNotes}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No encounters recorded yet.</p>
                  )}
                </div>
              </div>

              <Separator />

              <form onSubmit={handleAddVisit} className="space-y-3">
                <h3 className="font-semibold text-primary">Log new encounter</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="visitDate">Visit date</Label>
                    <Input
                      id="visitDate"
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="chiefComplaint">Chief complaint *</Label>
                    <Input
                      id="chiefComplaint"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="e.g. Follow-up blood pressure"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="diagnosis">Assessment / diagnosis (optional)</Label>
                    <Input
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="clinicalNotes">Clinical notes (optional)</Label>
                    <Textarea
                      id="clinicalNotes"
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      rows={2}
                      placeholder="Vitals, plan, patient education…"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="providerLabel">Provider (optional)</Label>
                    <Input
                      id="providerLabel"
                      value={providerLabel}
                      onChange={(e) => setProviderLabel(e.target.value)}
                      placeholder="e.g. Dr. Rao — Family Medicine"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={addVisit.isPending} className="w-full sm:w-auto">
                  {addVisit.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save encounter"
                  )}
                </Button>
              </form>
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientModal;
