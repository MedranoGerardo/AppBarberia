import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { NotificationType } from "./create-notification";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt?: any;
}

export async function getNotifications(
  barbershopId: string,
): Promise<NotificationItem[]> {
  const notificationsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "notifications",
  );

  const snapshot = await getDocs(notificationsRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<NotificationItem, "id">),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
}
