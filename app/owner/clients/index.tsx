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
    ClientReportItem,
    getClientsReport,
} from "../../../src/services/clients/get-clients-report";

import { useAuthStore } from "../../../src/store/auth.store";

export default function OwnerClientsScreen() {
  const { user } = useAuthStore();

  const barbershopId = user?.ownerBarbershopId || "";

  const [clients, setClients] = useState<ClientReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = async () => {
    try {
      if (!barbershopId) return;

      const data = await getClientsReport(barbershopId);

      const sorted = [...data].sort((a, b) => b.totalSpent - a.totalSpent);

      setClients(sorted);
    } catch (error) {
      console.log("Error cargando clientes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadClients();
    }, [barbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadClients();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando clientes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>

            <Text style={styles.badge}>CLIENTES</Text>

            <Text style={styles.title}>Clientes PRO</Text>

            <Text style={styles.subtitle}>
              Analiza clientes frecuentes, historial y gasto total.
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay clientes registrados</Text>

            <Text style={styles.emptyText}>
              Los clientes aparecerán cuando usen la app.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.clientCard}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{item.fullName}</Text>

                <Text style={styles.clientEmail}>{item.email}</Text>
              </View>

              {item.isFrequent && (
                <View style={styles.frequentBadge}>
                  <Text style={styles.frequentText}>⭐ Frecuente</Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Gastado</Text>
                <Text style={styles.statValue}>
                  ${item.totalSpent.toFixed(2)}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Citas</Text>
                <Text style={styles.statValue}>{item.appointmentsCount}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Compras</Text>
                <Text style={styles.statValue}>{item.purchasesCount}</Text>
              </View>
            </View>

            <View style={styles.visitBox}>
              <Text style={styles.visitLabel}>Última visita</Text>

              <Text style={styles.visitValue}>
                {item.lastVisit || "Sin visitas"}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
  },

  container: {
    padding: 20,
    paddingBottom: 30,
  },

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
    fontWeight: "800",
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
    marginBottom: 24,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
  },

  clientCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },

  clientName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },

  clientEmail: {
    fontSize: 14,
    color: "#666666",
  },

  frequentBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },

  frequentText: {
    color: "#92400E",
    fontWeight: "900",
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: "900",
    color: "#111111",
  },

  visitBox: {
    backgroundColor: "#EEF2FF",
    borderRadius: 18,
    padding: 14,
  },

  visitLabel: {
    fontSize: 12,
    color: "#4F46E5",
    marginBottom: 6,
    fontWeight: "700",
  },

  visitValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111111",
  },
});
