import { AppointmentStatus } from "../constants/appointment-status";

export interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;

  barbershopId: string;
  barbershopName: string;

  serviceId: string;
  serviceName: string;
  servicePrice: number;
  durationMinutes: number;

  employeeId: string;
  employeeName: string;

  date: string;
  startTime: string;
  endTime: string;

  status: AppointmentStatus;
  paymentMethod: "cash" | "card";

  approvedBy?: string | null;
  rejectedBy?: string | null;
  rescheduledBy?: string | null;
  reassignedBy?: string | null;

  rescheduleReason?: string | null;
  reassignmentReason?: string | null;

  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
