import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateHolidayInput {
  barbershopId: string;
  date: string;
  reason: string;
}

export async function createHoliday({
  barbershopId,
  date,
  reason,
}: CreateHolidayInput) {
  const holidaysRef = collection(db, "barbershops", barbershopId, "holidays");

  const docRef = await addDoc(holidaysRef, {
    date,
    reason: reason.trim(),
    isClosed: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
