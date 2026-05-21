import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppUser } from "../../types/user.types";

export async function getCurrentUser(uid: string): Promise<AppUser | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data() as AppUser;
}
