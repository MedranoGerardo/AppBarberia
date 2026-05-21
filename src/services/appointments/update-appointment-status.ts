import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function updateAppointmentStatus(
  barbershopId: string,
  appointmentId: string,
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled",
) {
  const appointmentRef = doc(
    db,
    "barbershops",
    barbershopId,
    "appointments",
    appointmentId,
  );

  await updateDoc(appointmentRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
