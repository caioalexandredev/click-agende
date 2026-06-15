export type ProfessionalStatus = "active" | "inactive";

export type Professional = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  profileImageUrl?: string;
  workStart: string;
  workEnd: string;
  serviceIds: string[];
  status: ProfessionalStatus;
  bio?: string;
  appointmentsThisWeek: number;
  rating: number;
};

export type ProfessionalServiceOption = {
  id: string;
  name: string;
  durationMin: number;
};
