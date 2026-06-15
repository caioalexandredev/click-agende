export type ProfessionalStatus = "active" | "inactive";

export type Professional = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  workStart: string;
  workEnd: string;
  status: ProfessionalStatus;
  bio?: string;
  appointmentsThisWeek: number;
  rating: number;
};
