import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function markNotificationRead(
  barbershopId: string,
  notificationId: string,
) {
  const notificationRef = doc(
    db,
    "barbershops",
    barbershopId,
    "notifications",
    notificationId,
  );

  await updateDoc(notificationRef, {
    read: true,
  });
}
