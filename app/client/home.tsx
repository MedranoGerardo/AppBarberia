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

export default function ClientHomeScreen() {
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
          <Text style={styles.badge}>CLIENTE</Text>

          <Text style={styles.title}>Hola, {user?.fullName || "Cliente"}</Text>

          <Text style={styles.subtitle}>
            Reserva citas, consulta tu historial y administra tu perfil.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.blueCard]}
            activeOpacity={0.85}
            onPress={() => router.push("/client/book-appointment" as any)}
          >
            <Text style={styles.icon}>📅</Text>
            <Text style={styles.actionTitleBlue}>Reservar</Text>
            <Text style={styles.actionTextBlue}>Agenda una nueva cita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.darkCard]}
            activeOpacity={0.85}
            onPress={() => router.push("/client/appointments" as any)}
          >
            <Text style={styles.icon}>✂️</Text>
            <Text style={styles.actionTitleDark}>Mis citas</Text>
            <Text style={styles.actionTextDark}>Revisa tus reservas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/client/history" as any)}
          >
            <Text style={styles.icon}>🕒</Text>
            <Text style={styles.actionTitle}>Historial</Text>
            <Text style={styles.actionText}>Servicios anteriores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/client/profile" as any)}
          >
            <Text style={styles.icon}>👤</Text>
            <Text style={styles.actionTitle}>Mi perfil</Text>
            <Text style={styles.actionText}>Datos personales</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Próximo paso</Text>
          <Text style={styles.infoText}>
            Ahora conectaremos la reserva real para seleccionar barbería,
            servicio, empleado, fecha y hora disponible.
          </Text>
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
    backgroundColor: "#111827",
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
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
  },
  subtitle: {
    color: "#D1D5DB",
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    minHeight: 145,
    justifyContent: "space-between",
  },
  blueCard: {
    backgroundColor: "#2F6BFF",
  },
  darkCard: {
    backgroundColor: "#111827",
  },
  icon: {
    fontSize: 28,
    marginBottom: 10,
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
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 21,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
