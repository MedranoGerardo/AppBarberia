import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function cancelClientAppointment(
  barbershopId: string,
  appointmentId: string,
) {
  const appointmentRef = doc(
    db,
    "barbershops",
    barbershopId,
    "appointments",
    appointmentId,
  );

  await updateDoc(appointmentRef, {
    status: "cancelled",
    cancelledBy: "client",
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
