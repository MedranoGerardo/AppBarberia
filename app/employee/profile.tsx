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
    EmployeeProfileData,
    getEmployeeProfile,
} from "../../src/services/employees/get-employee-profile";
import { useAuthStore } from "../../src/store/auth.store";

const dayLabels: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function EmployeeProfileScreen() {
  const { user } = useAuthStore();

  const barbershopId = user?.employeeBarbershopId || "";
  const employeeId = user?.employeeId || user?.uid || "";

  const [profile, setProfile] = useState<EmployeeProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      if (!barbershopId || !employeeId) return;

      const data = await getEmployeeProfile(barbershopId, employeeId);
      setProfile(data);
    } catch (error) {
      console.log("Error cargando perfil empleado:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [barbershopId, employeeId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  const workDaysText =
    profile?.workDays && profile.workDays.length > 0
      ? profile.workDays.map((day) => dayLabels[day] || day).join(", ")
      : "No configurado";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.badge}>PERFIL EMPLEADO</Text>

          <Text style={styles.name}>{profile?.fullName || "Empleado"}</Text>
          <Text style={styles.barbershop}>
            {profile?.barbershopName || "Barbería"}
          </Text>

          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: profile?.available ? "#22C55E" : "#EF4444",
                  },
                ]}
              />

              <Text style={styles.statusText}>
                {profile?.available ? "Disponible" : "No disponible"}
              </Text>
            </View>

            <View style={styles.rolePill}>
              <Text style={styles.roleText}>
                {profile?.isAdmin ? "Admin" : "Empleado"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Información personal</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo</Text>
            <Text style={styles.infoValue}>{profile?.email || "—"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{profile?.phone || "—"}</Text>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={styles.infoLabel}>Estado</Text>
            <Text style={styles.infoValue}>
              {profile?.status === "active" ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Horario laboral</Text>

        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleLabel}>Horario</Text>
          <Text style={styles.scheduleValue}>
            {profile?.startHour || "--"} - {profile?.endHour || "--"}
          </Text>

          <Text style={styles.scheduleLabel}>Días</Text>
          <Text style={styles.scheduleText}>{workDaysText}</Text>
        </View>

        <Text style={styles.sectionTitle}>Servicios asignados</Text>

        {profile?.services && profile.services.length > 0 ? (
          <View style={styles.servicesWrap}>
            {profile.services.map((service, index) => (
              <View key={`${service}-${index}`} style={styles.serviceChip}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin servicios asignados</Text>
            <Text style={styles.emptyText}>
              El dueño puede asignarte servicios desde el panel administrativo.
            </Text>
          </View>
        )}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Nota</Text>
          <Text style={styles.noteText}>
            Este perfil es informativo. Los cambios de horario, servicios y
            disponibilidad los administra el dueño.
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
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 14,
  },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
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
  name: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 8,
  },
  barbershop: {
    color: "#D1D5DB",
    fontSize: 16,
    fontWeight: "700",
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 12,
  },
  infoRowLast: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "800",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "900",
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  scheduleLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "800",
    marginBottom: 6,
  },
  scheduleValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 16,
  },
  scheduleText: {
    fontSize: 15,
    color: "#444444",
    lineHeight: 22,
    fontWeight: "700",
  },
  servicesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  serviceChip: {
    backgroundColor: "#E0ECFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  serviceText: {
    color: "#1D4ED8",
    fontWeight: "900",
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
