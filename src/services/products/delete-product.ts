import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function deleteProduct(barbershopId: string, productId: string) {
  const productRef = doc(
    db,
    "barbershops",
    barbershopId,
    "products",
    productId,
  );
  await deleteDoc(productRef);
}
