import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { DaySchedule, DEFAULT_SCHEDULE } from "./default-schedule";

export async function getSchedule(
  barbershopId: string,
): Promise<DaySchedule[]> {
  const scheduleRef = collection(db, "barbershops", barbershopId, "schedule");
  const snapshot = await getDocs(scheduleRef);

  if (snapshot.empty) {
    return DEFAULT_SCHEDULE;
  }

  const savedMap = new Map<string, DaySchedule>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data() as Omit<DaySchedule, "label"> & { label?: string };
    savedMap.set(doc.id, {
      day: data.day,
      label: data.label || doc.id,
      enabled: data.enabled,
      openTime: data.openTime,
      closeTime: data.closeTime,
    });
  });

  return DEFAULT_SCHEDULE.map((day) => savedMap.get(day.day) || day);
}
