import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface EmployeeAppointmentItem {
  id: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  price: number;
  paid?: boolean;
  paymentMethod?: "cash" | "card" | "transfer";
}

export async function getEmployeeAppointments(
  barbershopId: string,
  employeeId: string,
): Promise<EmployeeAppointmentItem[]> {
  const appointmentsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "appointments",
  );

  const snapshot = await getDocs(appointmentsRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<EmployeeAppointmentItem, "id">),
    }))
    .filter((appointment) => appointment.employeeId === employeeId)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
}
