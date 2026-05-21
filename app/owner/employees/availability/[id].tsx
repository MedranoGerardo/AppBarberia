import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  EmployeeDetail,
  getEmployeeById,
} from "../../../../src/services/employees/get-employee-by-id";
import { updateEmployeeAvailability } from "../../../../src/services/employees/update-employee-availability";
import { useAuthStore } from "../../../../src/store/auth.store";

const DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

export default function EmployeeAvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        if (!user?.ownerBarbershopId || !id) {
          Alert.alert("Error", "No se encontró información del empleado");
          router.back();
          return;
        }

        const employeeData = await getEmployeeById(user.ownerBarbershopId, id);

        if (!employeeData) {
          Alert.alert("Error", "No se encontró el empleado");
          router.back();
          return;
        }

        setEmployee(employeeData);
        setWorkDays(employeeData.workDays || []);
        setStartHour(employeeData.startHour || "");
        setEndHour(employeeData.endHour || "");
        setAvailable(
          employeeData.available !== undefined ? employeeData.available : true,
        );
      } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo cargar el empleado");
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id, user?.ownerBarbershopId]);

  const toggleDay = (dayKey: string) => {
    setWorkDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey],
    );
  };

  const handleSave = async () => {
    try {
      if (!user?.ownerBarbershopId || !id) return;

      if (available) {
        if (!startHour.trim() || !endHour.trim()) {
          Alert.alert("Error", "Completa hora de entrada y salida");
          return;
        }

        if (workDays.length === 0) {
          Alert.alert("Error", "Selecciona al menos un día laboral");
          return;
        }
      }

      await updateEmployeeAvailability({
        barbershopId: user.ownerBarbershopId,
        employeeId: id,
        workDays,
        startHour,
        endHour,
        available,
      });

      Alert.alert("Éxito", "Disponibilidad actualizada correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo guardar");
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2F6BFF" />
          <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
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

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>DISPONIBILIDAD</Text>
          </View>

          <Text style={styles.title}>
            Horario de{"\n"}
            <Text style={styles.titleAccent}>
              {employee?.fullName || "empleado"}
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Define si está disponible, qué días trabaja y en qué horario.
          </Text>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Empleado disponible</Text>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
                thumbColor={available ? "#2F6BFF" : "#F3F4F6"}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Días laborales</Text>

            <View style={styles.daysWrap}>
              {DAYS.map((day) => {
                const selected = workDays.includes(day.key);

                return (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      selected && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day.key)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selected && styles.dayButtonTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Horario</Text>

            <View style={styles.timeRow}>
              <View style={styles.timeBox}>
                <Text style={styles.label}>Entrada</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08:00"
                  placeholderTextColor="#9CA3AF"
                  value={startHour}
                  onChangeText={setStartHour}
                />
              </View>

              <View style={styles.timeBox}>
                <Text style={styles.label}>Salida</Text>
                <TextInput
                  style={styles.input}
                  placeholder="17:00"
                  placeholderTextColor="#9CA3AF"
                  value={endHour}
                  onChangeText={setEndHour}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#1A1A1A", "#2D2D2D"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                Guardar disponibilidad
              </Text>
            </LinearGradient>
          </TouchableOpacity>

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
    paddingHorizontal: 24,
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
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    letterSpacing: -0.3,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    marginBottom: 16,
  },
  badgeText: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  titleAccent: {
    color: "#2F6BFF",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  daysWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  dayButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dayButtonActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  dayButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  dayButtonTextActive: {
    color: "#FFFFFF",
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeBox: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
