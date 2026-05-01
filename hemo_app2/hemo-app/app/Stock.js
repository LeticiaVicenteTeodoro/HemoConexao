import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const stockData = [
  { type: "O+", status: "Crítico" },
  { type: "O-", status: "Crítico" },
  { type: "A+", status: "Alerta" },
  { type: "A-", status: "Crítico" },
  { type: "B+", status: "Adequado" },
  { type: "B-", status: "Alerta" },
  { type: "AB+", status: "Estável" },
  { type: "AB-", status: "Alerta" },
];

const statusColor = {
  Crítico: "#D32F2F",
  Alerta: "#F57C00",
  Adequado: "#388E3C",
  Estável: "#1976D2",
};

export default function Stock() {
  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Estoque de Sangue</Text>

      {/* barra superior estilo HemoMinas */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Consulte o melhor momento para doar ❤️
        </Text>
      </View>

      {/* GRID */}
      <View style={styles.grid}>
        {stockData.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.type}>{item.type}</Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor[item.status] },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B71C1C",
    marginBottom: 10,
  },

  banner: {
    backgroundColor: "#B71C1C",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  bannerText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "47%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },

  type: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});