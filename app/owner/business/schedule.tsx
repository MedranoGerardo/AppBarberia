import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { DaySchedule } from "../../../src/services/schedule/default-schedule";
import { getSchedule } from "../../../src/services/schedule/get-schedule";
import { saveSchedule } from "../../../src/services/schedule/save-schedule";
import { useAuthStore } from "../../../src/store/auth.store";

export default function BusinessScheduleScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        if (!barbershopId) {
          Alert.alert("Error", "No se encontró la barbería");
          router.back();
          return;
        }

        const data = await getSchedule(barbershopId);
        setSchedule(data);
      } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo cargar el horario");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [barbershopId]);

  const updateDay = (
    day: string,
    field: keyof DaySchedule,
    value: string | boolean,
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSave = async () => {
    try {
      if (!barbershopId) return;

      for (const item of schedule) {
        if (item.enabled) {
          if (!item.openTime.trim() || !item.closeTime.trim()) {
            Alert.alert("Error", `Completa horario de ${item.label}`);
            return;
          }
        }
      }

      setSaving(true);
      await saveSchedule(barbershopId, schedule);
      Alert.alert("Éxito", "Horario guardado correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo guardar el horario");
    } finally {
      setSaving(false);
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
          <Text style={styles.loadingText}>Cargando horario...</Text>
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
            <Text style={styles.badgeText}>HORARIO</Text>
          </View>

          <Text style={styles.title}>
            Horario de la{"\n"}
            <Text style={styles.titleAccent}>barbería</Text>
          </Text>

          <Text style={styles.subtitle}>
            Configura qué días abre tu negocio y en qué horario atenderás
            clientes.
          </Text>

          <View style={styles.card}>
            {schedule.map((item) => (
              <View key={item.day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{item.label}</Text>
                  <Switch
                    value={item.enabled}
                    onValueChange={(value) =>
                      updateDay(item.day, "enabled", value)
                    }
                    trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
                    thumbColor={item.enabled ? "#2F6BFF" : "#F3F4F6"}
                  />
                </View>

                {item.enabled ? (
                  <View style={styles.timeRow}>
                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>Apertura</Text>
                      <TextInput
                        style={styles.input}
                        value={item.openTime}
                        onChangeText={(value) =>
                          updateDay(item.day, "openTime", value)
                        }
                        placeholder="08:00"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>Cierre</Text>
                      <TextInput
                        style={styles.input}
                        value={item.closeTime}
                        onChangeText={(value) =>
                          updateDay(item.day, "closeTime", value)
                        }
                        placeholder="18:00"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.closedText}>Cerrado este día</Text>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              saving && styles.primaryButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <LinearGradient
              colors={["#1A1A1A", "#2D2D2D"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Guardando..." : "Guardar horario"}
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
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  timeBox: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  closedText: {
    marginTop: 16,
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  primaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
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
