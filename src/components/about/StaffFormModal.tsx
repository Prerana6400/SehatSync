import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { StaffMember, StaffStatus } from "@/types/staff";

type StaffFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function StaffFormModal({ open, onClose }: StaffFormModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [status, setStatus] = useState<StaffStatus>("ACTIVE");

  const createMut = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        department: department.trim(),
        contactNumber: contactNumber.trim(),
        status,
      };

      return apiFetch<StaffMember>("/api/about/staff", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["about", "staff"] });
      onClose();
    },
  });

  const canSubmit = name.trim().length > 0 && role.trim().length > 0 && department.trim().length > 0 && contactNumber.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add staff details</DialogTitle>
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
              <Label htmlFor="st-name">Staff name</Label>
              <Input id="st-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-role">Role</Label>
              <Input id="st-role" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-dept">Department</Label>
              <Input
                id="st-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-contact">Contact number</Label>
              <Input
                id="st-contact"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StaffStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createMut.isPending}>
              {createMut.isPending ? "Saving…" : "Save staff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

