import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { logout } from "../../src/services/auth/logout";
import {
  getOwnerDashboardData,
  OwnerDashboardData,
} from "../../src/services/barbershops/get-owner-dashboard-data";
import { useAuthStore } from "../../src/store/auth.store";

export default function OwnerDashboardScreen() {
  const { user, logoutStore } = useAuthStore();
  const ownerName = user?.fullName || "Dueño";
  const barbershopId = user?.ownerBarbershopId || "";

  const [dashboardData, setDashboardData] = useState<OwnerDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      logoutStore();

      setTimeout(() => {
        router.replace("/");
      }, 50);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo cerrar sesión");
    }
  };

  const loadDashboard = useCallback(async () => {
    try {
      if (!barbershopId) {
        setError("No se encontró la barbería del dueño");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const data = await getOwnerDashboardData(barbershopId);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  if (loading) {
    return (
      <LinearGradient
        colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2F6BFF" />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Espaciado superior extra */}
          <View style={styles.topSpacer} />

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DASHBOARD</Text>
            </View>

            <Text style={styles.greeting}>Hola, {ownerName}</Text>
            <Text style={styles.title}>
              {dashboardData?.businessName || "Administra tu barbería"}
            </Text>
            <Text style={styles.subtitle}>
              {dashboardData?.description ||
                "Gestiona tu negocio desde un solo lugar."}
            </Text>

            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: dashboardData?.isOpen
                        ? "#22C55E"
                        : "#EF4444",
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {dashboardData?.isOpen ? "Negocio activo" : "Negocio cerrado"}
                </Text>
              </View>

              <View style={styles.idPill}>
                <Text style={styles.idPillText}>
                  ID: {barbershopId.slice(0, 8)}...
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#DC2626", "#B91C1C"]}
                style={styles.logoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCardDark}>
              <Text style={styles.statLabelDark}>Citas hoy</Text>
              <Text style={styles.statValueDark}>
                {dashboardData?.appointmentsToday ?? 0}
              </Text>
              <Text style={styles.statHintDark}>Reservas del día</Text>
            </View>

            <View style={styles.statCardBlue}>
              <Text style={styles.statLabelBlue}>Tipo negocio</Text>
              <Text style={styles.statValueBlue}>
                {dashboardData?.businessType === "barbershop"
                  ? "Barbería"
                  : dashboardData?.businessType === "salon"
                    ? "Peluquería"
                    : "Ambos"}
              </Text>
              <Text style={styles.statHintBlue}>Configuración actual</Text>
            </View>

            <View style={styles.statCardLight}>
              <Text style={styles.statLabel}>Empleados</Text>
              <Text style={styles.statValue}>
                {dashboardData?.employeesCount ?? 0}
              </Text>
              <Text style={styles.statHint}>Registrados</Text>
            </View>

            <View style={styles.statCardLight}>
              <Text style={styles.statLabel}>Productos</Text>
              <Text style={styles.statValue}>
                {dashboardData?.productsCount ?? 0}
              </Text>
              <Text style={styles.statHint}>En catálogo</Text>
            </View>

            <View style={styles.statCardLightFull}>
              <Text style={styles.statLabel}>Servicios</Text>
              <Text style={styles.statValue}>
                {dashboardData?.servicesCount ?? 0}
              </Text>
              <Text style={styles.statHint}>Disponibles para clientes</Text>
            </View>
          </View>

          {/* Acciones rápidas */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/appointments" as any)}
            >
              <Text style={styles.quickActionTitle}>Citas</Text>
              <Text style={styles.quickActionText}>Gestiona reservas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/employees" as any)}
            >
              <Text style={styles.quickActionTitle}>Empleados</Text>
              <Text style={styles.quickActionText}>Administra personal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/services" as any)}
            >
              <Text style={styles.quickActionTitle}>Servicios</Text>
              <Text style={styles.quickActionText}>
                Edita precios y tiempos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/products" as any)}
            >
              <Text style={styles.quickActionTitle}>Productos</Text>
              <Text style={styles.quickActionText}>Controla inventario</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/product-sales" as any)}
            >
              <Text style={styles.quickActionTitle}>Ventas</Text>
              <Text style={styles.quickActionText}>
                Vende productos y calcula ganancias
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/finance" as any)}
            >
              <Text style={styles.quickActionTitle}>Finanzas</Text>
              <Text style={styles.quickActionText}>
                Ventas, ganancias y reportes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/cash-closure" as any)}
            >
              <Text style={styles.quickActionTitle}>Caja</Text>
              <Text style={styles.quickActionText}>
                Cierre diario de ingresos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/reports" as any)}
            >
              <Text style={styles.quickActionTitle}>Reportes</Text>
              <Text style={styles.quickActionText}>Ingresos por fecha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/business/holidays" as any)}
            >
              <Text style={styles.quickActionTitle}>Festivos</Text>
              <Text style={styles.quickActionText}>
                Configura cierres especiales
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard]}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/business/schedule" as any)}
            >
              <Text style={styles.quickActionTitle}>Horario</Text>
              <Text style={styles.quickActionText}>Configura días y horas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/clients" as any)}
            >
              <Text style={styles.quickActionTitle}>Clientes</Text>

              <Text style={styles.quickActionText}>
                Historial y clientes frecuentes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push("/owner/notifications" as any)}
            >
              <Text style={styles.quickActionTitle}>Notificaciones</Text>
              <Text style={styles.quickActionText}>
                Alertas y avisos importantes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Resumen del negocio */}
          <View style={styles.bottomCard}>
            <Text style={styles.bottomTitle}>Resumen del negocio</Text>
            <Text style={styles.bottomText}>
              Este panel ya está conectado a Firebase. Aquí puedes ver los datos
              reales de tu barbería, el conteo de servicios, productos,
              empleados y citas del día.
            </Text>
          </View>

          {/* Espaciado inferior extra */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topSpacer: {
    height: 20,
  },
  bottomSpacer: {
    height: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111827",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#2F6BFF",
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#D4D4D4",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  idPill: {
    backgroundColor: "#1F2937",
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  idPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  logoutButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 20,
  },
  logoutGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCardDark: {
    width: "48%",
    backgroundColor: "#1F2937",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statCardBlue: {
    width: "48%",
    backgroundColor: "#2F6BFF",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#2F6BFF",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statCardLight: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statCardLightFull: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statLabelDark: {
    color: "#D4D4D4",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  statValueDark: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
  },
  statHintDark: {
    color: "#A3A3A3",
    fontSize: 12,
  },
  statLabelBlue: {
    color: "#DDE7FF",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  statValueBlue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
  },
  statHintBlue: {
    color: "#EAF0FF",
    fontSize: 12,
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  statValue: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
  },
  statHint: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  quickActionText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
  },
  bottomCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  bottomTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  bottomText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
  },

  salesButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  salesButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
