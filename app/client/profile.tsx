import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../../src/config/firebase";
import { useAuthStore } from "../../src/store/auth.store";

export default function ClientProfileScreen() {
  const { user, setUser, logoutStore } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("Error", "No se encontró el usuario");
        return;
      }

      if (!fullName.trim()) {
        Alert.alert("Error", "El nombre es obligatorio");
        return;
      }

      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        phone: phone.trim(),
        updatedAt: serverTimestamp(),
      });

      setUser({
        ...user,
        fullName: fullName.trim(),
        phone: phone.trim(),
      });

      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logoutStore();
      router.replace("/auth/login" as any);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo cerrar sesión");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.badge}>MI PERFIL</Text>

          <Text style={styles.title}>{user?.fullName || "Cliente"}</Text>

          <Text style={styles.subtitle}>
            Administra tu información personal.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Datos personales</Text>

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#8A8A8A"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email || ""}
            editable={false}
          />

          <Text style={styles.helperText}>
            El correo se usa para iniciar sesión y no se puede cambiar desde
            esta pantalla.
          </Text>

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu teléfono"
            placeholderTextColor="#8A8A8A"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F7" },
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
    padding: 26,
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
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
  },
  subtitle: {
    color: "#D1D5DB",
    fontSize: 16,
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111111",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
  },
  disabledInput: {
    opacity: 0.65,
    backgroundColor: "#F3F4F6",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
