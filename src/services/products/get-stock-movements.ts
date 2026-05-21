import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface StockMovementItem {
  id: string;
  type: "add" | "remove";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt?: any;
}

export async function getStockMovements(
  barbershopId: string,
  productId: string,
): Promise<StockMovementItem[]> {
  const movementsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "products",
    productId,
    "stockMovements",
  );

  const snapshot = await getDocs(movementsRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<StockMovementItem, "id">),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
}
