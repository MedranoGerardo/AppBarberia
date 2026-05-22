import { Slot, router, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../src/config/firebase";
import { getCurrentUser } from "../src/services/user/get-current-user";
import { useAuthStore } from "../src/store/auth.store";

export default function RootLayout() {
  const { user, setUser, loading, setLoading } = useAuthStore();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);

        if (!firebaseUser) {
          setUser(null);
          return;
        }

        const appUser = await getCurrentUser(firebaseUser.uid);
        setUser(appUser);
      } catch (error) {
        console.log("Error rehidratando sesión:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setLoading, setUser]);

  useEffect(() => {
    if (!isMounted || loading) return;

    const inAuth = segments[0] === "auth";
    const inOwner = segments[0] === "owner";
    const inClient = segments[0] === "client";
    const inEmployee = segments[0] === "employee";
    const inRoot = !segments[0];
    if (!user) {
      if (!inAuth && !inRoot) {
        router.replace("/auth/login" as any);
      }
      return;
    }

    if (user.role === "owner" || user.role === "admin") {
      if (!inOwner) {
        router.replace("/owner/dashboard" as any);
      }
      return;
    }

    if (user.role === "employee") {
      const currentRoute = segments.join("/");

      const isEmployeeAdminRoute = currentRoute.startsWith("employee/admin");
      const isEmployeeNormalRoute =
        currentRoute === "employee/panel" ||
        currentRoute === "employee/appointments" ||
        currentRoute === "employee/profile";

      if (user.isAdmin) {
        if (!inEmployee || (!isEmployeeAdminRoute && !isEmployeeNormalRoute)) {
          router.replace("/employee/admin" as any);
        }
        return;
      }

      if (!inEmployee || isEmployeeAdminRoute) {
        router.replace("/employee/panel" as any);
      }

      return;
    }

    if (!inClient) {
      router.replace("/client/home" as any);
    }
  }, [isMounted, loading, user, segments]);

  if (!isMounted || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F5F7",
        }}
      >
        <ActivityIndicator size="large" color="#2F6BFF" />
      </View>
    );
  }
  return <Slot />;
}
