import { StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../src/store/auth.store";

export default function EmployeePanelScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Empleado</Text>
      <Text style={styles.text}>Bienvenido: {user?.fullName}</Text>
      <Text style={styles.text}>Rol: {user?.role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
  },
});
