import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteEmployee } from "../../../src/services/employees/delete-employee";
import {
  EmployeeItem,
  getEmployees,
} from "../../../src/services/employees/get-employees";
import { useAuthStore } from "../../../src/store/auth.store";

export default function OwnerEmployeesScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEmployees = async () => {
    try {
      if (!barbershopId) return;
      const data = await getEmployees(barbershopId);
      setEmployees(data);
    } catch (error) {
      console.log("Error cargando empleados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadEmployees();
    }, [barbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmployees();
  };

  const handleDelete = (employeeId: string) => {
    Alert.alert("Eliminar empleado", "¿Deseas eliminar este empleado?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEmployee(barbershopId, employeeId);
            loadEmployees();
            Alert.alert("Éxito", "Empleado eliminado");
          } catch (error: any) {
            Alert.alert("Error", error.message || "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2F6BFF" />
          <Text style={styles.loadingText}>Cargando empleados...</Text>
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
        <View style={styles.container}>
          {/* Espaciado superior extra */}
          <View style={styles.topSpacer} />

          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>EMPLEADOS</Text>
            </View>
            <Text style={styles.title}>Tu personal</Text>
            <Text style={styles.subtitle}>
              Administra a los empleados y administradores de tu barbería.
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/owner/employees/create" as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2F6BFF", "#1E4FD8"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.addButtonText}>+ Nuevo empleado</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <FlatList
            data={employees}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Aún no tienes empleados</Text>
                <Text style={styles.emptyText}>
                  Crea tu primer empleado para asignar servicios y gestionar
                  citas.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.employeeCard}>
                <View style={styles.topRow}>
                  <View style={styles.nameWrap}>
                    <Text style={styles.employeeName}>{item.fullName}</Text>
                    <Text style={styles.employeeEmail}>{item.email}</Text>
                  </View>

                  <View
                    style={[
                      styles.rolePill,
                      item.isAdmin ? styles.adminPill : styles.employeePill,
                    ]}
                  >
                    <Text style={styles.rolePillText}>
                      {item.isAdmin ? "Admin" : "Empleado"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.phoneText}>Teléfono: {item.phone}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Estado</Text>
                    <Text style={styles.metaValue}>{item.status}</Text>
                  </View>

                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Disponible</Text>
                    <Text style={styles.metaValue}>
                      {item.available ? "Sí" : "No"}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsWrap}>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push(`/owner/employees/edit/${item.id}` as any)
                      }
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.servicesButton}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push(`/owner/employees/${item.id}` as any)
                      }
                    >
                      <Text style={styles.servicesButtonText}>Servicios</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.availabilityButton}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push(
                          `/owner/employees/availability/${item.id}` as any,
                        )
                      }
                    >
                      <Text style={styles.availabilityButtonText}>
                        Disponibilidad
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.85}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topSpacer: {
    height: 20,
  },
  header: {
    marginBottom: 24,
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
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 20,
  },
  addButton: {
    alignSelf: "flex-start",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#2F6BFF",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gradientButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingBottom: 30,
    gap: 16,
  },
  emptyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  employeeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  nameWrap: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  employeeEmail: {
    fontSize: 13,
    color: "#6B7280",
  },
  phoneText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  rolePill: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  adminPill: {
    backgroundColor: "#DBEAFE",
  },
  employeePill: {
    backgroundColor: "#DCFCE7",
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
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
  actionsWrap: {
    marginTop: 16,
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  servicesButton: {
    flex: 1,
    backgroundColor: "#2F6BFF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  servicesButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  availabilityButton: {
    flex: 1,
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  availabilityButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
