import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    BarberService,
    getServices,
} from "../../src/services/services/get-services";
import { useAuthStore } from "../../src/store/auth.store";

export default function EmployeeAdminServicesScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.employeeBarbershopId || "";

  const [services, setServices] = useState<BarberService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadServices = async () => {
    try {
      if (!barbershopId) return;
      const data = await getServices(barbershopId);
      setServices(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadServices();
    }, [barbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>

            <Text style={styles.badge}>SERVICIOS</Text>
            <Text style={styles.title}>Servicios disponibles</Text>
            <Text style={styles.subtitle}>
              Consulta precios, duración y estado de los servicios.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay servicios</Text>
            <Text style={styles.emptyText}>
              El owner aún no ha configurado servicios.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceDescription}>
                  {item.description || "Sin descripción"}
                </Text>
              </View>

              <View
                style={[
                  styles.statusPill,
                  item.isActive ? styles.activePill : styles.inactivePill,
                ]}
              >
                <Text style={styles.statusText}>
                  {item.isActive ? "Activo" : "Inactivo"}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Precio</Text>
                <Text style={styles.statValue}>${item.price}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Duración</Text>
                <Text style={styles.statValue}>{item.durationMinutes} min</Text>
              </View>
            </View>
          </View>
        )}
      />
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
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#111111",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 22,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
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
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  serviceName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666666",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  activePill: { backgroundColor: "#DCFCE7" },
  inactivePill: { backgroundColor: "#E5E7EB" },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F7F7F8",
    borderRadius: 18,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
  },
});
