import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const statusColor = {
  Critico: "#D32F2F",
  Alerta: "#F57C00",
  Adequado: "#388E3C",
  Estavel: "#1976D2",
};

export default function Stock() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://192.168.1.20:8000/estoque")
      .then((res) => {
        console.log("STATUS HTTP:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("DADOS RECEBIDOS:", data);

        const formatted = Object.entries(data).map(([type, status]) => ({
          type,
          status,
        }));

        setStockData(formatted);
      })
      .catch((err) => {
        console.log("ERRO NO FETCH:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estoque de Sangue</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Consulte o melhor momento para doar ❤️
        </Text>
      </View>

      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Carregando...
        </Text>
      ) : (
        <View style={styles.grid}>
          {stockData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.type}>{item.type}</Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor[item.status] || "#999" },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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