import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import type { AppointmentRow } from "@/types/appointment";
import type { Doctor } from "@/types/doctor";
import type { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";
import { AppointmentTable } from "@/components/AppointmentTable";

const Appointments = () => {
  const queryClient = useQueryClient();
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentRow | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const [patientId, setPatientId] = useState<string>("");
  const [doctorName, setDoctorName] = useState("");
  const [dateStr, setDateStr] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [timeStr, setTimeStr] = useState("09:00");

  const selectedKey = format(selectedDate, "yyyy-MM-dd");

  const from = startOfMonth(viewMonth).toISOString();
  const to = endOfMonth(viewMonth).toISOString();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", from, to],
    queryFn: () =>
      apiFetch<AppointmentRow[]>(`/api/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => apiFetch<Patient[]>("/api/patients"),
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["about", "doctors"],
    queryFn: () => apiFetch<Doctor[]>("/api/about/doctors"),
  });

  const byDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of appointments) {
      const d = format(new Date(a.startAt), "yyyy-MM-dd");
      m.set(d, (m.get(d) ?? 0) + 1);
    }
    return m;
  }, [appointments]);

  const selectedAppointments = useMemo(() => {
    return appointments.filter((a) => format(new Date(a.startAt), "yyyy-MM-dd") === selectedKey);
  }, [appointments, selectedKey]);

  useEffect(() => {
    if (!modalOpen) setDateStr(selectedKey);
  }, [selectedKey, modalOpen]);

  const monthStart = startOfMonth(viewMonth);
  const monthDays = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(viewMonth),
  });
  const leadingBlankDays = monthStart.getDay();

  const invalidateRelated = () => {
    void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    void queryClient.invalidateQueries({ queryKey: ["alerts", "overview"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
  };

  const cancelMut = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      }),
    onSuccess: invalidateRelated,
  });

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch("/api/appointments", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      invalidateRelated();
      setModalOpen(false);
    },
  });

  const rescheduleMut = useMutation({
    mutationFn: ({ id, startAt }: { id: number; startAt: string }) =>
      apiFetch(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ startAt }),
      }),
    onSuccess: () => {
      invalidateRelated();
      setRescheduleOpen(false);
      setRescheduleTarget(null);
    },
  });

  const openReschedule = (a: AppointmentRow) => {
    setRescheduleTarget(a);
    const d = new Date(a.startAt);
    setRescheduleDate(format(d, "yyyy-MM-dd"));
    setRescheduleTime(format(d, "HH:mm"));
    setRescheduleOpen(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    const startAt = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
    rescheduleMut.mutate({ id: rescheduleTarget.id, startAt: startAt.toISOString() });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = parseInt(patientId, 10);
    if (!pid || !doctorName.trim()) return;
    const startAt = new Date(`${dateStr}T${timeStr}:00`);
    createMut.mutate({
      patientId: pid,
      doctorName: doctorName.trim(),
      startAt: startAt.toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage patient visits.</p>
          </div>
          <Button
            onClick={() => {
              setDateStr(selectedKey);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-12rem)] items-stretch">
          <Card className="lg:col-span-1 border-border h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {format(viewMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const next = subMonths(viewMonth, 1);
                    setViewMonth(next);
                    const first = new Date(next);
                    first.setDate(1);
                    first.setHours(0, 0, 0, 0);
                    setSelectedDate(first);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const next = addMonths(viewMonth, 1);
                    setViewMonth(next);
                    const first = new Date(next);
                    first.setDate(1);
                    first.setHours(0, 0, 0, 0);
                    setSelectedDate(first);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="font-medium py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: leadingBlankDays }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" aria-hidden />
                ))}
                {monthDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const n = byDay.get(key) ?? 0;
                  const isToday = isSameDay(day, new Date());
                  const isSelected = key === selectedKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      aria-pressed={isSelected}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-md text-xs border border-transparent",
                        isSelected && "bg-primary/10 border-primary/30 ring-1 ring-primary/20",
                        !isSelected && isToday && "bg-primary/10 border-primary/30",
                        !isSelected && n > 0 && "bg-secondary"
                      )}
                    >
                      <span>{format(day, "d")}</span>
                      {n > 0 && (
                        <span className="text-[10px] text-primary font-medium">{n} appt</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border h-full flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">
                Appointments · {format(selectedDate, "MMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0 sm:p-6">
              <div className="h-full overflow-auto">
                <AppointmentTable
                  appointments={selectedAppointments}
                  loading={isLoading}
                  onReschedule={openReschedule}
                  onCancel={(id) => cancelMut.mutate(id)}
                  emptyStateText={`No appointments on ${format(selectedDate, "MMM d, yyyy")}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={rescheduleOpen}
        onOpenChange={(o) => {
          setRescheduleOpen(o);
          if (!o) setRescheduleTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
          </DialogHeader>
          {rescheduleTarget && (
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {rescheduleTarget.patientName} · {rescheduleTarget.doctorName}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rd">Date</Label>
                  <Input
                    id="rd"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rt">Time</Label>
                  <Input
                    id="rt"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={rescheduleMut.isPending}>
                {rescheduleMut.isPending ? "Saving…" : "Save new time"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Patient</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} ({p.contact})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor</Label>
              <Select value={doctorName} onValueChange={setDoctorName} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name} ({d.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {doctors.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Add doctors from About page to enable scheduling.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="d">Date</Label>
                <Input
                  id="d"
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="t">Time</Label>
                <Input
                  id="t"
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending}>
              {createMut.isPending ? "Saving…" : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
