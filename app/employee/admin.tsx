import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../src/config/firebase";
import { useAuthStore } from "../../src/store/auth.store";

export default function EmployeeAdminScreen() {
  const { user, logoutStore } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      logoutStore();

      router.replace("/auth/login");
    } catch (error) {
      console.log("Error cerrando sesión:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.badge}>ADMIN EMPLEADO</Text>

          <Text style={styles.heroTitle}>
            Hola, {user?.fullName || "Administrador"}
          </Text>

          <Text style={styles.heroSubtitle}>
            Gestiona citas, empleados y operaciones del día.
          </Text>

          <View style={styles.heroPills}>
            <View style={styles.availablePill}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>Administrador</Text>
            </View>

            <View style={styles.secondaryPill}>
              <Text style={styles.secondaryPillText}>Panel interno</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Gestión rápida</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.blueCard]}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/admin-appointments" as any)}
          >
            <Text style={styles.actionTitleBlue}>Citas</Text>
            <Text style={styles.actionTextBlue}>Reservas y pagos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.darkCard]}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/admin-services" as any)}
          >
            <Text style={styles.actionTitleDark}>Servicios</Text>
            <Text style={styles.actionTextDark}>Precios y duración</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/admin-products" as any)}
          >
            <Text style={styles.actionTitle}>Productos</Text>
            <Text style={styles.actionText}>Inventario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/admin-product-sales" as any)}
          >
            <Text style={styles.actionTitle}>Ventas</Text>
            <Text style={styles.actionText}>Registrar ventas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/admin-cash-closure" as any)}
          >
            <Text style={styles.actionTitle}>Caja</Text>
            <Text style={styles.actionText}>Cierre diario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/profile" as any)}
          >
            <Text style={styles.actionTitle}>Perfil</Text>
            <Text style={styles.actionText}>Mi información</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },

  container: {
    padding: 20,
    paddingBottom: 34,
  },

  heroCard: {
    backgroundColor: "#0F172A",
    borderRadius: 32,
    padding: 26,
    marginBottom: 28,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#2F6BFF",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 18,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
  },

  heroSubtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 22,
  },

  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  availablePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  availableDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },

  availableText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  secondaryPill: {
    backgroundColor: "#1E293B",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  secondaryPillText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  actionCardDark: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
  },

  actionCardBlue: {
    backgroundColor: "#2F6BFF",
    borderRadius: 28,
    padding: 24,
  },

  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    minHeight: 145,
    justifyContent: "space-between",
  },

  actionTitleDark: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 6,
  },

  actionTextDark: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
  },

  actionTitleBlue: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 6,
  },

  actionTextBlue: {
    color: "#E0E7FF",
    fontSize: 13,
    lineHeight: 18,
  },

  actionTitle: {
    color: "#111111",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 6,
  },

  actionText: {
    color: "#666666",
    fontSize: 13,
    lineHeight: 18,
  },

  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 28,
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  blueCard: {
    backgroundColor: "#2F6BFF",
  },

  darkCard: {
    backgroundColor: "#111827",
  },
});
