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
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate">{doctor.name}</CardTitle>
            <div className="mt-1">
              <Badge variant="outline" className="font-normal">
                {doctor.specialization}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
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

        {(doctor.yearsExperience != null || doctor.description) && (
          <div className="space-y-2">
            {doctor.yearsExperience != null && (
              <Badge variant="secondary" className="font-normal w-fit">
                {doctor.yearsExperience} years experience
              </Badge>
            )}

            {doctor.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{doctor.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description provided.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

