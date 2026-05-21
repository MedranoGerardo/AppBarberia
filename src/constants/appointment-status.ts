export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  RESCHEDULED: "rescheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];
