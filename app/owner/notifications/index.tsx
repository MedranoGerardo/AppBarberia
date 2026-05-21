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
import {
    getNotifications,
    NotificationItem,
} from "../../../src/services/notifications/get-notifications";
import { markNotificationRead } from "../../../src/services/notifications/mark-notification-read";
import { useAuthStore } from "../../../src/store/auth.store";

export default function OwnerNotificationsScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      if (!barbershopId) return;

      const data = await getNotifications(barbershopId);
      setNotifications(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron cargar");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadNotifications();
    }, [barbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleRead = async (notificationId: string) => {
    try {
      await markNotificationRead(barbershopId, notificationId);
      await loadNotifications();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo marcar como leída");
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    if (type === "appointment") return "📅";
    if (type === "stock") return "📦";
    if (type === "sale") return "💰";
    return "🔔";
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={notifications}
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

            <Text style={styles.badge}>NOTIFICACIONES</Text>
            <Text style={styles.title}>Centro de avisos</Text>
            <Text style={styles.subtitle}>
              Revisa alertas de citas, ventas, stock y actividad importante.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pendientes</Text>
              <Text style={styles.summaryValue}>{unreadCount}</Text>
              <Text style={styles.summaryText}>notificaciones sin leer</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptyText}>
              Cuando ocurra algo importante, aparecerá aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationCard, !item.read && styles.unreadCard]}
            activeOpacity={0.85}
            onPress={() => handleRead(item.id)}
          >
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{getIcon(item.type)}</Text>
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.topRow}>
                <Text style={styles.notificationTitle}>{item.title}</Text>

                {!item.read && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.notificationMessage}>{item.message}</Text>

              <Text style={styles.notificationStatus}>
                {item.read ? "Leída" : "Tocar para marcar como leída"}
              </Text>
            </View>
          </TouchableOpacity>
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
  container: { padding: 20, paddingBottom: 30 },
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
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
  },
  summaryLabel: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "900",
    marginTop: 4,
  },
  summaryText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
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
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    gap: 14,
  },
  unreadCard: {
    borderWidth: 2,
    borderColor: "#2F6BFF",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#2F6BFF",
    marginTop: 5,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
  },
  notificationStatus: {
    fontSize: 12,
    color: "#2F6BFF",
    fontWeight: "800",
    marginTop: 10,
  },
});
