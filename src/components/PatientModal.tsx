import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, Calendar, Heart, Users } from "lucide-react";
import { Patient } from "@/types/patient";

interface PatientModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

const PatientModal = ({ patient, isOpen, onClose }: PatientModalProps) => {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-6 w-6 mr-2 text-primary" />
            {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-primary">Personal Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Age</Badge>
                  <span>{patient.age} years old</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Gender</Badge>
                  <span>{patient.gender}</span>
                </div>
                {patient.bloodType && (
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    <span>Blood Type: {patient.bloodType}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-primary">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-medical-blue" />
                  {patient.contact}
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-medical-blue" />
                  {patient.email}
                </div>
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-medical-blue" />
                  <span>{patient.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {patient.emergencyContact && (
            <div>
              <h3 className="font-semibold text-primary mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Emergency Contact
              </h3>
              <p className="text-sm bg-secondary p-3 rounded-lg">{patient.emergencyContact}</p>
            </div>
          )}

          {/* Medical History */}
          {patient.medicalHistory && (
            <div>
              <h3 className="font-semibold text-primary mb-2">Medical History</h3>
              <p className="text-sm bg-medical-light p-4 rounded-lg border-l-4 border-l-medical-green">
                {patient.medicalHistory}
              </p>
            </div>
          )}

          {/* Last Visit */}
          {patient.lastVisit && (
            <div>
              <h3 className="font-semibold text-primary mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last Visit
              </h3>
              <p className="text-sm">{patient.lastVisit}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientModal;