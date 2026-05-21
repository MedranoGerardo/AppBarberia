import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface HolidayItem {
  id: string;
  date: string;
  reason: string;
  isClosed: boolean;
}

export async function getHolidays(
  barbershopId: string,
): Promise<HolidayItem[]> {
  const holidaysRef = collection(db, "barbershops", barbershopId, "holidays");
  const q = query(holidaysRef, orderBy("date", "asc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<HolidayItem, "id">),
  }));
}
