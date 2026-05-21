import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface ProductSaleItem {
  id: string;
  productId: string;
  productName: string;
  customerId?: string;
  customerName?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
  profit: number;
  paymentMethod: "cash" | "card" | "transfer";
  createdAt?: any;
}

export async function getProductSales(
  barbershopId: string,
): Promise<ProductSaleItem[]> {
  const salesRef = collection(db, "barbershops", barbershopId, "productSales");
  const snapshot = await getDocs(salesRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ProductSaleItem, "id">),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
}
