import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { OwnerAppointmentItem } from "./get-owner-appointments";

export async function getAppointmentById(
  barbershopId: string,
  appointmentId: string,
): Promise<OwnerAppointmentItem | null> {
  const appointmentRef = doc(
    db,
    "barbershops",
    barbershopId,
    "appointments",
    appointmentId,
  );

  const snapshot = await getDoc(appointmentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<OwnerAppointmentItem, "id">),
  };
}
