import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Patient } from "@/types/patient";

type PatientFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialPatient?: Patient | null;
  onSubmit: (data: Omit<Patient, "id" | "visits" | "visitCount"> & { id?: number }) => Promise<void>;
};

const emptyForm = {
  name: "",
  age: "",
  contact: "",
  email: "",
  address: "",
  gender: "",
  bloodType: "",
  allergies: "",
  emergencyContact: "",
  medicalHistory: "",
  primaryCondition: "",
  assignedDoctor: "",
};

export function PatientFormModal({
  open,
  onClose,
  mode,
  initialPatient,
  onSubmit,
}: PatientFormModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialPatient) {
      setFormData({
        name: initialPatient.name,
        age: String(initialPatient.age),
        contact: initialPatient.contact,
        email: initialPatient.email,
        address: initialPatient.address,
        gender: initialPatient.gender,
        bloodType: initialPatient.bloodType ?? "",
        allergies: initialPatient.allergies ?? "",
        emergencyContact: initialPatient.emergencyContact ?? "",
        medicalHistory: initialPatient.medicalHistory ?? "",
        primaryCondition: initialPatient.primaryCondition ?? "",
        assignedDoctor: initialPatient.assignedDoctor ?? "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [open, mode, initialPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.contact || !formData.email) return;
    setSubmitting(true);
    try {
      const payload: Omit<Patient, "id" | "visits" | "visitCount"> & { id?: number } = {
        name: formData.name,
        age: parseInt(formData.age, 10),
        contact: formData.contact,
        email: formData.email,
        address: formData.address,
        gender: formData.gender || "unspecified",
        bloodType: formData.bloodType || undefined,
        allergies: formData.allergies || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        medicalHistory: formData.medicalHistory || undefined,
        primaryCondition: formData.primaryCondition || undefined,
        assignedDoctor: formData.assignedDoctor || undefined,
        lastVisit: mode === "add" ? new Date().toISOString().slice(0, 10) : initialPatient?.lastVisit,
      };
      if (mode === "edit" && initialPatient) {
        payload.id = initialPatient.id;
      }
      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add new patient" : "Edit patient"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pf-name">Full name *</Label>
              <Input
                id="pf-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="pf-age">Age *</Label>
              <Input
                id="pf-age"
                type="number"
                min={1}
                max={150}
                value={formData.age}
                onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="pf-gender">Gender</Label>
              <Select
                value={formData.gender || undefined}
                onValueChange={(v) => setFormData((p) => ({ ...p, gender: v }))}
              >
                <SelectTrigger id="pf-gender">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pf-phone">Phone *</Label>
              <Input
                id="pf-phone"
                value={formData.contact}
                onChange={(e) => setFormData((p) => ({ ...p, contact: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="pf-email">Email *</Label>
              <Input
                id="pf-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="pf-blood">Blood type</Label>
              <Select
                value={formData.bloodType || undefined}
                onValueChange={(v) => setFormData((p) => ({ ...p, bloodType: v }))}
              >
                <SelectTrigger id="pf-blood">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="pf-address">Address</Label>
            <Input
              id="pf-address"
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pf-condition">Primary condition / reason for care</Label>
            <Input
              id="pf-condition"
              value={formData.primaryCondition}
              onChange={(e) => setFormData((p) => ({ ...p, primaryCondition: e.target.value }))}
              placeholder="e.g. Type 2 diabetes, Asthma"
            />
          </div>
          <div>
            <Label htmlFor="pf-doctor">Assigned doctor</Label>
            <Input
              id="pf-doctor"
              value={formData.assignedDoctor}
              onChange={(e) => setFormData((p) => ({ ...p, assignedDoctor: e.target.value }))}
              placeholder="Clinician name"
            />
          </div>
          <div>
            <Label htmlFor="pf-ec">Emergency contact</Label>
            <Input
              id="pf-ec"
              value={formData.emergencyContact}
              onChange={(e) => setFormData((p) => ({ ...p, emergencyContact: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pf-allergies">Allergies</Label>
            <Textarea
              id="pf-allergies"
              rows={2}
              value={formData.allergies}
              onChange={(e) => setFormData((p) => ({ ...p, allergies: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pf-mh">Medical history / notes</Label>
            <Textarea
              id="pf-mh"
              rows={3}
              value={formData.medicalHistory}
              onChange={(e) => setFormData((p) => ({ ...p, medicalHistory: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : mode === "add" ? "Add patient" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
