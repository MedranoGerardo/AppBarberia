import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface OccupiedAppointment {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export async function getOccupiedSlots(
  barbershopId: string,
  employeeId: string,
  date: string,
): Promise<OccupiedAppointment[]> {
  const appointmentsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "appointments",
  );

  const q = query(
    appointmentsRef,
    where("employeeId", "==", employeeId),
    where("date", "==", date),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<OccupiedAppointment, "id">),
    }))
    .filter(
      (item) => item.status !== "cancelled" && item.status !== "rejected",
    );
}
