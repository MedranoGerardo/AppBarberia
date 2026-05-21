import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateOwnerAppointmentInput {
  barbershopId: string;
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

export async function createOwnerAppointment({
  barbershopId,
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
}: CreateOwnerAppointmentInput) {
  const appointmentsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "appointments",
  );

  const docRef = await addDoc(appointmentsRef, {
    customerId,
    customerName,
    employeeId,
    employeeName,
    serviceId,
    serviceName,
    date,
    startTime,
    endTime,
    status: "pending",
    price,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
