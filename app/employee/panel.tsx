import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  EmployeeDashboardData,
  getEmployeeDashboardData,
} from "../../src/services/employees/get-employee-dashboard-data";
import { useAuthStore } from "../../src/store/auth.store";

export default function EmployeePanelScreen() {
  const { user } = useAuthStore();

  const barbershopId = user?.employeeBarbershopId || "";
  const employeeId = user?.uid || "";

  const [dashboardData, setDashboardData] =
    useState<EmployeeDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      if (!barbershopId || !employeeId) return;

      const data = await getEmployeeDashboardData(barbershopId, employeeId);
      setDashboardData(data);
    } catch (error) {
      console.log("Error cargando dashboard empleado:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadDashboard();
    }, [barbershopId, employeeId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando panel empleado...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>EMPLEADO</Text>
          </View>

          <Text style={styles.greeting}>
            Hola, {dashboardData?.employeeName || "Empleado"}
          </Text>

          <Text style={styles.title}>
            {dashboardData?.barbershopName || "Panel"}
          </Text>

          <Text style={styles.subtitle}>
            Gestiona tus citas, servicios y disponibilidad del día.
          </Text>

          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: dashboardData?.available
                      ? "#22C55E"
                      : "#EF4444",
                  },
                ]}
              />

              <Text style={styles.statusText}>
                {dashboardData?.available ? "Disponible" : "No disponible"}
              </Text>
            </View>

            <View style={styles.rolePill}>
              <Text style={styles.roleText}>
                {dashboardData?.isAdmin ? "Admin" : "Empleado"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCardDark}>
            <Text style={styles.statLabelDark}>Citas hoy</Text>
            <Text style={styles.statValueDark}>
              {dashboardData?.appointmentsToday ?? 0}
            </Text>
            <Text style={styles.statHintDark}>Reservas asignadas</Text>
          </View>

          <View style={styles.statCardBlue}>
            <Text style={styles.statLabelBlue}>Próximas</Text>
            <Text style={styles.statValueBlue}>
              {dashboardData?.upcomingAppointments ?? 0}
            </Text>
            <Text style={styles.statHintBlue}>Citas pendientes</Text>
          </View>

          <View style={styles.statCardLight}>
            <Text style={styles.statLabel}>Servicios</Text>
            <Text style={styles.statValue}>
              {dashboardData?.servicesCount ?? 0}
            </Text>
            <Text style={styles.statHint}>Asignados</Text>
          </View>

          <View style={styles.statCardLight}>
            <Text style={styles.statLabel}>Horario</Text>
            <Text style={styles.statValueSmall}>
              {dashboardData?.startHour || "--"} -{" "}
              {dashboardData?.endHour || "--"}
            </Text>
            <Text style={styles.statHint}>Jornada laboral</Text>
          </View>
        </View>

        <View style={styles.scheduleCard}>
          <Text style={styles.sectionTitle}>Días laborales</Text>

          <Text style={styles.scheduleText}>
            {dashboardData?.workDays?.length
              ? dashboardData.workDays.join(", ")
              : "No configurado"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/employee/appointments" as any)}
          >
            <Text style={styles.actionTitle}>Mis citas</Text>
            <Text style={styles.actionText}>
              Ver citas asignadas y próximas reservas.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
            <Text style={styles.actionTitle}>Mi perfil</Text>
            <Text style={styles.actionText}>
              Consulta tu información y disponibilidad.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Resumen</Text>
          <Text style={styles.infoText}>
            Este panel está conectado a Firebase y muestra la información real
            del empleado según su barbería asignada.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F7" },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#333" },
  container: { padding: 20, paddingBottom: 34 },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#2F6BFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 18,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
  },
  subtitle: {
    color: "#D1D5DB",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginRight: 8,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  rolePill: {
    backgroundColor: "#1F2937",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  roleText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
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
  },
  statCardBlue: {
    width: "48%",
    backgroundColor: "#2F6BFF",
    borderRadius: 24,
    padding: 18,
  },
  statCardLight: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  statLabelDark: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  statValueDark: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  statHintDark: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
  },
  statLabelBlue: {
    color: "#DDE7FF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  statValueBlue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  statHintBlue: {
    color: "#EAF0FF",
    fontSize: 12,
    marginTop: 6,
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  statValue: {
    color: "#111111",
    fontSize: 32,
    fontWeight: "900",
  },
  statValueSmall: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "900",
  },
  statHint: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 14,
  },
  scheduleText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555555",
    fontWeight: "700",
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
