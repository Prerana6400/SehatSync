import { Phone, Mail, User, Calendar, Hash, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/types/patient";
import { formatMrn, formatVisitDate, formatRelativeFromDate } from "@/lib/format";

interface PatientCardProps {
  patient: Patient;
  onViewDetails: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
}

const PatientCard = ({ patient, onViewDetails, onEdit }: PatientCardProps) => {
  const visits = patient.visitCount ?? 0;
  const condition = patient.primaryCondition || patient.medicalHistory?.slice(0, 60) || "—";
  const lastVisitLabel = patient.lastVisit
    ? `${formatVisitDate(patient.lastVisit)} (${formatRelativeFromDate(patient.lastVisit)})`
    : "No visit on file";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary shrink-0" />
              {patient.name}
            </CardTitle>
            <p className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {formatMrn(patient.id)}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs capitalize shrink-0">
            {patient.gender}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Age</span>
            <span className="font-medium">{patient.age}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Phone className="h-4 w-4 mr-2 text-primary shrink-0" />
            <span className="truncate">{patient.contact}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Mail className="h-4 w-4 mr-2 text-primary shrink-0" />
            <span className="truncate">{patient.email}</span>
          </div>
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span className="text-foreground line-clamp-2">{condition}</span>
          </div>
          <div className="flex items-start text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <span className="text-xs">{lastVisitLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground">{visits} encounter(s) on file</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button onClick={() => onViewDetails(patient)} className="flex-1" variant="default">
            View Details
          </Button>
          {onEdit && (
            <Button type="button" variant="outline" className="flex-1" onClick={() => onEdit(patient)}>
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
