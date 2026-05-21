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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createHoliday } from "../../../src/services/holidays/create-holiday";
import { deleteHoliday } from "../../../src/services/holidays/delete-holiday";
import {
  getHolidays,
  HolidayItem,
} from "../../../src/services/holidays/get-holidays";
import { useAuthStore } from "../../../src/store/auth.store";

export default function BusinessHolidaysScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const loadHolidays = async () => {
    try {
      if (!barbershopId) return;
      const data = await getHolidays(barbershopId);
      setHolidays(data);
    } catch (error) {
      console.log("Error cargando días festivos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadHolidays();
    }, [barbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadHolidays();
  };

  const handleCreateHoliday = async () => {
    try {
      if (!barbershopId) {
        Alert.alert("Error", "No se encontró la barbería");
        return;
      }

      if (!date.trim() || !reason.trim()) {
        Alert.alert("Error", "Completa fecha y motivo");
        return;
      }

      await createHoliday({
        barbershopId,
        date,
        reason,
      });

      setDate("");
      setReason("");
      await loadHolidays();
      Alert.alert("Éxito", "Día festivo guardado");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo guardar");
    }
  };

  const handleDelete = (holidayId: string) => {
    Alert.alert(
      "Eliminar día festivo",
      "¿Deseas eliminar este cierre especial?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHoliday(barbershopId, holidayId);
              await loadHolidays();
              Alert.alert("Éxito", "Día festivo eliminado");
            } catch (error: any) {
              Alert.alert("Error", error.message || "No se pudo eliminar");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2F6BFF" />
          <Text style={styles.loadingText}>Cargando días festivos...</Text>
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
        <FlatList
          data={holidays}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={
            <View>
              {/* Espaciado superior extra - aumentado */}
              <View style={styles.topSpacer} />

              {/* Botón de volver */}
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                style={styles.backButton}
              >
                <Text style={styles.backText}>← Volver</Text>
              </TouchableOpacity>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>FESTIVOS</Text>
              </View>
              <Text style={styles.title}>Días festivos y cierres</Text>
              <Text style={styles.subtitle}>
                Define fechas en las que tu barbería no trabajará.
              </Text>

              <View style={styles.formCard}>
                <Text style={styles.label}>Fecha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={date}
                  onChangeText={setDate}
                />

                <Text style={styles.label}>Motivo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ejemplo: Navidad"
                  placeholderTextColor="#9CA3AF"
                  value={reason}
                  onChangeText={setReason}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCreateHoliday}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#1A1A1A", "#2D2D2D"]}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.primaryButtonText}>
                      Guardar día festivo
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Fechas registradas</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No hay días festivos registrados
              </Text>
              <Text style={styles.emptyText}>
                Agrega cierres especiales para evitar reservas en esas fechas.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.holidayCard}>
              <View style={styles.holidayInfo}>
                <Text style={styles.holidayDate}>{item.date}</Text>
                <Text style={styles.holidayReason}>{item.reason}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={<View style={styles.bottomSpacer} />}
        />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topSpacer: {
    height: 40, // Aumentado de 20 a 40
  },
  bottomSpacer: {
    height: 30,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
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
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 24,
  },
  formCard: {
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: -0.2,
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
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 16,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  emptyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
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
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },
  holidayCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  holidayInfo: {
    flex: 1,
    marginRight: 10,
  },
  holidayDate: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  holidayReason: {
    fontSize: 14,
    color: "#6B7280",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#DC2626",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
