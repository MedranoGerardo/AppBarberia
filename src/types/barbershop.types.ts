export interface Barbershop {
  id?: string;
  name: string;
  businessType: "barbershop" | "salon" | "both";
  description: string;
  ownerId: string;
  phone: string;
  email?: string;
  address: string;
  zone: string;
  location: {
    lat: number;
    lng: number;
  };
  paymentMethods: ("cash" | "card")[];
  isOpen: boolean;
  coverImage?: string;
  logo?: string;
  monthlyRevenue?: number;
  yearlyRevenue?: number;
  totalServicesCompletedMonth?: number;
  totalServicesCompletedYear?: number;
  totalProductsSoldMonth?: number;
  totalProductsSoldYear?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}
