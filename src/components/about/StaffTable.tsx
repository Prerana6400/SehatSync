import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { StaffMember, StaffStatus } from "@/types/staff";

type StaffTableProps = {
  staff: StaffMember[];
  canEdit?: boolean;
};

function statusToLabel(status: StaffStatus) {
  return status === "ACTIVE" ? "Active" : "On Leave";
}

function statusToBadgeVariant(status: StaffStatus) {
  return status === "ACTIVE" ? "secondary" : "outline";
}

export function StaffTable({ staff, canEdit = false }: StaffTableProps) {
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<number | null>(null);

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: StaffStatus }) => {
      setSavingId(id);
      await apiFetch(`/api/about/staff/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["about", "staff"] });
      setSavingId(null);
    },
    onError: () => {
      setSavingId(null);
    },
  });

  const hasStaff = useMemo(() => staff.length > 0, [staff.length]);

  return (
    <CardContent>
      {hasStaff ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell className="whitespace-nowrap">{s.contactNumber}</TableCell>
                  <TableCell className="min-w-[170px]">
                    {canEdit ? (
                      <div className="flex items-center gap-3">
                        <Select
                          value={s.status}
                          disabled={savingId === s.id}
                          onValueChange={(v) => {
                            const next = v as StaffStatus;
                            updateStatusMut.mutate({ id: s.id, status: next });
                          }}
                        >
                          <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant={statusToBadgeVariant(s.status)} className="hidden sm:inline-flex">
                          {statusToLabel(s.status)}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="hidden sm:inline-flex"
                          disabled={savingId === s.id}
                          onClick={() => {
                            // Status is auto-saved on change. This button provides feedback only.
                          }}
                        >
                          {savingId === s.id ? "Saving…" : "Saved"}
                        </Button>
                      </div>
                    ) : (
                      <Badge variant={statusToBadgeVariant(s.status)}>{statusToLabel(s.status)}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No staff records found.</p>
      )}
    </CardContent>
  );
}

