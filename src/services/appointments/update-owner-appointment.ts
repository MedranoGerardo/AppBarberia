import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface UpdateOwnerAppointmentInput {
  barbershopId: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export async function updateOwnerAppointment({
  barbershopId,
  appointmentId,
  customerId,
  customerName,
  employeeId,
  employeeName,
  serviceId,
  serviceName,
  date,
  startTime,
  endTime,
  price,
}: UpdateOwnerAppointmentInput) {
  const appointmentRef = doc(
    db,
    "barbershops",
    barbershopId,
    "appointments",
    appointmentId,
  );

  await updateDoc(appointmentRef, {
    customerId,
    customerName,
    employeeId,
    employeeName,
    serviceId,
    serviceName,
    date,
    startTime,
    endTime,
    price,
    updatedAt: serverTimestamp(),
  });
}
