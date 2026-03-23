import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doctor } from "@/types/doctor";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

type DoctorCardProps = {
  doctor: Doctor;
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate">{doctor.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{doctor.specialization}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">Availability</p>
          <div className="flex flex-wrap gap-2">
            {doctor.availableDays.map((d) => (
              <Badge key={d} variant="secondary" className="font-normal">
                {d}
              </Badge>
            ))}
          </div>
        </div>

        {doctor.yearsExperience != null && (
          <p className="text-sm text-muted-foreground">
            {doctor.yearsExperience} years experience
          </p>
        )}

        {doctor.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{doctor.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No description provided.</p>
        )}
      </CardContent>
    </Card>
  );
}

