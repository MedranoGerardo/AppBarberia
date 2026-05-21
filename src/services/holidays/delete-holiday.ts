import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function deleteHoliday(barbershopId: string, holidayId: string) {
  const holidayRef = doc(
    db,
    "barbershops",
    barbershopId,
    "holidays",
    holidayId,
  );
  await deleteDoc(holidayRef);
}
