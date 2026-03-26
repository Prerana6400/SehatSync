import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppointmentRow, AppointmentStatus } from "@/types/appointment";

export const appointmentStatusVariant: Record<
  AppointmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SCHEDULED: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
  NO_SHOW: "outline",
};

type AppointmentTableProps = {
  appointments: AppointmentRow[];
  loading: boolean;
  onReschedule: (a: AppointmentRow) => void;
  onCancel: (id: number) => void;
  emptyStateText?: string;
};

export function AppointmentTable({
  appointments,
  loading,
  onReschedule,
  onCancel,
  emptyStateText,
}: AppointmentTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Doctor</TableHead>
          <TableHead>Date & time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              {emptyStateText ?? "No appointments"}
            </TableCell>
          </TableRow>
        ) : (
          appointments.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.patientName}</TableCell>
              <TableCell>{a.doctorName}</TableCell>
              <TableCell className="whitespace-nowrap">
                {format(new Date(a.startAt), "MMM d, yyyy h:mm a")}
              </TableCell>
              <TableCell>
                <Badge variant={appointmentStatusVariant[a.status]}>{a.status}</Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {a.status !== "CANCELLED" && a.status !== "COMPLETED" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onReschedule(a)}>
                      Reschedule
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onCancel(a.id)}>
                      Cancel
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
