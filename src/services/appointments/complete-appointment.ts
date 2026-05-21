import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export type AppointmentPaymentMethod = "cash" | "card" | "transfer";

export async function completeAppointment(
  barbershopId: string,
  appointmentId: string,
  paymentMethod: AppointmentPaymentMethod,
) {
  const appointmentRef = doc(
    db,
    "barbershops",
    barbershopId,
    "appointments",
    appointmentId,
  );

  await updateDoc(appointmentRef, {
    status: "completed",
    paid: true,
    paymentMethod,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
