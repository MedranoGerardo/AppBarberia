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
        </View>

        <Text style={styles.sectionTitle}>Gestión rápida</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.actionCardDark}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/appointments" as any)}
          >
            <Text style={styles.actionTitleDark}>Citas</Text>

            <Text style={styles.actionTextDark}>
              Gestiona y completa citas asignadas.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardBlue}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/admin-appointments" as any)}
          >
            <Text style={styles.actionTitleBlue}>Todas las citas</Text>

            <Text style={styles.actionTextBlue}>
              Revisa las reservas generales.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/admin-services" as any)}
          >
            <Text style={styles.actionTitle}>Servicios</Text>

            <Text style={styles.actionText}>
              Consulta servicios disponibles.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/profile" as any)}
          >
            <Text style={styles.actionTitle}>Mi perfil</Text>

            <Text style={styles.actionText}>
              Consulta tu información laboral.
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
    gap: 16,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
  },

  actionTitleDark: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },

  actionTextDark: {
    color: "#D1D5DB",
    fontSize: 15,
    lineHeight: 22,
  },

  actionTitleBlue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },

  actionTextBlue: {
    color: "#E0E7FF",
    fontSize: 15,
    lineHeight: 22,
  },

  actionTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },

  actionText: {
    color: "#666666",
    fontSize: 15,
    lineHeight: 22,
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
});
