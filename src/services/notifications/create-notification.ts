import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

export type NotificationType = "appointment" | "stock" | "sale" | "system";

interface CreateNotificationInput {
  barbershopId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export async function createNotification({
  barbershopId,
  title,
  message,
  type,
}: CreateNotificationInput) {
  const notificationsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "notifications",
  );

  await addDoc(notificationsRef, {
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
}
