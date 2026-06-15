export type ServiceStatus = "active" | "inactive";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  status: ServiceStatus;
  imageUrl: string;
  appointmentsThisMonth: number;
};
