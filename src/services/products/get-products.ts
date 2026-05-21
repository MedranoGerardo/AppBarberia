import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  status: "active" | "inactive";
}

export async function getProducts(
  barbershopId: string,
): Promise<ProductItem[]> {
  const productsRef = collection(db, "barbershops", barbershopId, "products");
  const snapshot = await getDocs(productsRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ProductItem, "id">),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
