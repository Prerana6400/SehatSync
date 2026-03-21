import { Phone, Mail, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
  onViewDetails: (patient: Patient) => void;
}

const PatientCard = ({ patient, onViewDetails }: PatientCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            {patient.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Age {patient.age}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2 text-medical-blue" />
            {patient.contact}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2 text-medical-blue" />
            {patient.email}
          </div>
          {patient.lastVisit && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 text-medical-green" />
              Last visit: {patient.lastVisit}
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => onViewDetails(patient)}
            className="w-full"
            variant="outline"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;