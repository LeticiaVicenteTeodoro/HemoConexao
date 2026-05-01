import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Step5() {

  const finish = () => {
    router.replace("/(tabs)/Home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qual seu tipo sanguíneo?</Text>

      <View style={styles.grid}>
        {types.map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.btn}
            onPress={finish}
          >
            <Text style={styles.txt}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { textAlign: "center", color: "#E30613", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  btn: {
    width: "48%",
    backgroundColor: "#E30613",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  txt: { color: "#fff", fontWeight: "bold" },
});