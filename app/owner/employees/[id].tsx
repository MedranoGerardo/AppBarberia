import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import {
  EmployeeDetail,
  getEmployeeById,
} from "../../../src/services/employees/get-employee-by-id";
import { updateEmployeeSpecialties } from "../../../src/services/employees/update-employee-specialties";
import {
  BarberService,
  getServices,
} from "../../../src/services/services/get-services";
import { useAuthStore } from "../../../src/store/auth.store";

export default function EmployeeSpecialtiesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [services, setServices] = useState<BarberService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.ownerBarbershopId || !id) {
          Alert.alert("Error", "No se encontró información del empleado");
          router.back();
          return;
        }

        const [employeeData, servicesData] = await Promise.all([
          getEmployeeById(user.ownerBarbershopId, id),
          getServices(user.ownerBarbershopId),
        ]);

        if (!employeeData) {
          Alert.alert("Error", "No se encontró el empleado");
          router.back();
          return;
        }

        setEmployee(employeeData);
        setServices(servicesData);
        setSelectedServiceIds(employeeData.specialties || []);
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.message || "No se pudieron cargar los datos",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user?.ownerBarbershopId]);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleSave = async () => {
    try {
      if (!user?.ownerBarbershopId || !id) return;

      await updateEmployeeSpecialties(
        user.ownerBarbershopId,
        id,
        selectedServiceIds,
      );

      Alert.alert("Éxito", "Especialidades actualizadas correctamente");
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
          <Text style={styles.loadingText}>Cargando empleado...</Text>
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
            <Text style={styles.badgeText}>ESPECIALIDADES</Text>
          </View>

          <Text style={styles.title}>
            Asignar servicios a{"\n"}
            <Text style={styles.titleAccent}>{employee?.fullName}</Text>
          </Text>

          <Text style={styles.subtitle}>
            Selecciona qué servicios puede realizar este empleado.
          </Text>

          <View style={styles.card}>
            {services.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No hay servicios creados</Text>
                <Text style={styles.emptyText}>
                  Primero crea servicios para poder asignarlos a un empleado.
                </Text>
              </View>
            ) : (
              services.map((service) => {
                const selected = selectedServiceIds.includes(service.id);

                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      selected && styles.serviceCardSelected,
                    ]}
                    onPress={() => toggleService(service.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.serviceHeader}>
                      <View style={styles.checkboxOuter}>
                        <View
                          style={[
                            styles.checkboxInner,
                            selected && styles.checkboxInnerActive,
                          ]}
                        />
                      </View>

                      <View style={styles.serviceInfo}>
                        <Text
                          style={[
                            styles.serviceName,
                            selected && styles.serviceNameSelected,
                          ]}
                        >
                          {service.name}
                        </Text>
                        <Text
                          style={[
                            styles.serviceDescription,
                            selected && styles.serviceDescriptionSelected,
                          ]}
                        >
                          {service.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaBox}>
                        <Text style={styles.metaLabel}>Precio</Text>
                        <Text style={styles.metaValue}>${service.price}</Text>
                      </View>

                      <View style={styles.metaBox}>
                        <Text style={styles.metaLabel}>Duración</Text>
                        <Text style={styles.metaValue}>
                          {service.durationMinutes} min
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

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
                  Guardar especialidades
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  emptyCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    padding: 24,
    marginBottom: 8,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  serviceCardSelected: {
    borderColor: "#2F6BFF",
    backgroundColor: "#EEF4FF",
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2F6BFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  checkboxInnerActive: {
    backgroundColor: "#2F6BFF",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  serviceNameSelected: {
    color: "#1D4ED8",
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  serviceDescriptionSelected: {
    color: "#3B82F6",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  metaBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 14,
  },
  metaLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "600",
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
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
