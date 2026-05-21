import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { ProductItem } from "./get-products";

export async function getProductById(
  barbershopId: string,
  productId: string,
): Promise<ProductItem | null> {
  const productRef = doc(
    db,
    "barbershops",
    barbershopId,
    "products",
    productId,
  );
  const snapshot = await getDoc(productRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ProductItem, "id">),
  };
}
