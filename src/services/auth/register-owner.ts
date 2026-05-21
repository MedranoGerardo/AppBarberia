import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { ROLES } from "../../constants/roles";

interface RegisterOwnerInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  businessType: "barbershop" | "salon" | "both";
  description: string;
  address: string;
  zone: string;
  lat: number;
  lng: number;
}

export async function registerOwner({
  fullName,
  email,
  password,
  phone,
  businessName,
  businessType,
  description,
  address,
  zone,
  lat,
  lng,
}: RegisterOwnerInput) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = credential.user;

  const barbershopRef = doc(collection(db, "barbershops"));

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    phone,
    role: ROLES.OWNER,
    status: "active",
    preferredLanguage: "es",
    photoUrl: "",
    ownerBarbershopId: barbershopRef.id,
    employeeBarbershopId: null,
    isAdmin: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(barbershopRef, {
    name: businessName,
    businessType,
    description,
    ownerId: user.uid,
    phone,
    email,
    address,
    zone,
    location: {
      lat,
      lng,
    },
    paymentMethods: ["cash", "card"],
    isOpen: true,
    rating: 0,
    totalServicesCompletedMonth: 0,
    totalServicesCompletedYear: 0,
    totalProductsSoldMonth: 0,
    totalProductsSoldYear: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { user, barbershopId: barbershopRef.id };
}
