import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface OwnerAppointmentItem {
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
  paidAt?: any;
}

export async function getOwnerAppointments(
  barbershopId: string,
): Promise<OwnerAppointmentItem[]> {
  const appointmentsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "appointments",
  );

  const snapshot = await getDocs(appointmentsRef);

  const appointments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<OwnerAppointmentItem, "id">),
  }));

  return appointments.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}
