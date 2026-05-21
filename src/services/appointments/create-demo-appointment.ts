import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateDemoAppointmentInput {
  barbershopId: string;
  customerName: string;
  employeeName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export async function createDemoAppointment({
  barbershopId,
  customerName,
  employeeName,
  serviceName,
  date,
  startTime,
  endTime,
  price,
}: CreateDemoAppointmentInput) {
  const appointmentsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "appointments",
  );

  const docRef = await addDoc(appointmentsRef, {
    customerId: "",
    customerName: customerName.trim(),
    employeeId: "",
    employeeName: employeeName.trim(),
    serviceId: "",
    serviceName: serviceName.trim(),
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
