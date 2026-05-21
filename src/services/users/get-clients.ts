import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface ClientItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
}

export async function getClients(): Promise<ClientItem[]> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "client"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ClientItem, "id">),
  }));
}
