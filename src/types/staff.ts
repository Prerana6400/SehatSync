export type StaffStatus = "ACTIVE" | "ON_LEAVE";

export type StaffMember = {
  id: number;
  name: string;
  role: string;
  department: string;
  contactNumber: string;
  status: StaffStatus;
};

