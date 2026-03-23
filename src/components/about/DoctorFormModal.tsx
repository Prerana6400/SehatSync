import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Doctor } from "@/types/doctor";
import { apiFetch } from "@/lib/api";

type DoctorFormModalProps = {
  open: boolean;
  onClose: () => void;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function normalizeOptionalText(v: string) {
  const trimmed = v.trim();
  return trimmed.length ? trimmed : undefined;
}

export function DoctorFormModal({ open, onClose }: DoctorFormModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!specialization.trim()) return false;
    if (availableDays.length === 0) return false;
    return true;
  }, [name, specialization, availableDays.length]);

  const createMut = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        specialization: specialization.trim(),
        availableDays,
        description: normalizeOptionalText(description) ?? null,
        yearsExperience:
          yearsExperience.trim().length > 0 ? Number.parseInt(yearsExperience, 10) : null,
      };

      return apiFetch<Doctor>("/api/about/doctors", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["about", "doctors"] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add doctor profile</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit || createMut.isPending) return;
            createMut.mutate();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc-name">Doctor name</Label>
              <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-spec">Specialization</Label>
              <Input
                id="doc-spec"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Available days (select at least one)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {days.map((d) => {
                const checked = availableDays.includes(d);
                return (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const isChecked = v === true;
                        setAvailableDays((prev) => {
                          if (isChecked) {
                            return prev.includes(d) ? prev : [...prev, d];
                          }
                          return prev.filter((x) => x !== d);
                        });
                      }}
                    />
                    <span>{d}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-years">Years of experience (optional)</Label>
            <Input
              id="doc-years"
              type="number"
              min={0}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-desc">Short description (optional)</Label>
            <Textarea
              id="doc-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Cardiology consultation and follow-up planning."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createMut.isPending}>
              {createMut.isPending ? "Saving…" : "Save doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

