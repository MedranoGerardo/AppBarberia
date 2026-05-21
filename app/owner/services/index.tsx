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
import { deleteService } from "../../../src/services/services/delete-service";
import {
  BarberService,
  getServices,
} from "../../../src/services/services/get-services";
import { useAuthStore } from "../../../src/store/auth.store";

export default function OwnerServicesScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";
  const [services, setServices] = useState<BarberService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadServices = async () => {
    try {
      if (!user?.ownerBarbershopId) return;

      const data = await getServices(user.ownerBarbershopId);
      setServices(data);
    } catch (error) {
      console.log("Error cargando servicios:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (serviceId: string) => {
    Alert.alert("Eliminar servicio", "¿Deseas eliminar este servicio?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sí, eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteService(barbershopId, serviceId);
            loadServices();
            Alert.alert("Éxito", "Servicio eliminado");
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadServices();
    }, [user?.ownerBarbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2F6BFF" />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
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
            <View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SERVICIOS</Text>
              </View>
              <Text style={styles.title}>Tus servicios</Text>
              <Text style={styles.subtitle}>
                Administra lo que ofreces a tus clientes.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/owner/services/create" as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2F6BFF", "#1E4FD8"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.addButtonText}>+ Nuevo servicio</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <FlatList
            data={services}
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
                <Text style={styles.emptyTitle}>Aún no tienes servicios</Text>
                <Text style={styles.emptyText}>
                  Crea tu primer servicio para que aparezca en reservas y en el
                  dashboard.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.serviceCard}>
                <View style={styles.serviceTopRow}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.isActive
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.isActive ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.serviceDescription}>
                  {item.description}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Precio</Text>
                    <Text style={styles.metaValue}>${item.price}</Text>
                  </View>

                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Duración</Text>
                    <Text style={styles.metaValue}>
                      {item.durationMinutes} min
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      router.push(`/owner/services/${item.id}` as any)
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
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
  serviceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  serviceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginRight: 10,
    letterSpacing: -0.3,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 16,
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
  statusPill: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusActive: {
    backgroundColor: "#DCFCE7",
  },
  statusInactive: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#DC2626",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
