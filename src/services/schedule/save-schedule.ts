import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { DaySchedule } from "./default-schedule";

export async function saveSchedule(
  barbershopId: string,
  schedule: DaySchedule[],
) {
  await Promise.all(
    schedule.map((item) =>
      setDoc(doc(db, "barbershops", barbershopId, "schedule", item.day), {
        day: item.day,
        label: item.label,
        enabled: item.enabled,
        openTime: item.openTime,
        closeTime: item.closeTime,
        updatedAt: serverTimestamp(),
      }),
    ),
  );
}
