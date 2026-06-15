export type ProfessionalStatus = "active" | "inactive";

export type Professional = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: ProfessionalStatus;
  bio?: string;
  appointmentsThisWeek: number;
  rating: number;
};

