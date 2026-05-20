import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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
      {/* BOTÃO VOLTAR */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#E30613" />
      </TouchableOpacity>

      {/* TÍTULO */}
      <Text style={styles.title}>Estoque de Sangue</Text>

      {/* BANNER */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Consulte o melhor momento para doar ❤️
        </Text>
      </View>

      {/* CONTEÚDO */}
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <View style={styles.grid}>
          {stockData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.type}>{item.type}</Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      statusColor[item.status] || "#999",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {item.status}
                </Text>
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

  /* BOTÃO VOLTAR */
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
  },

  /* TÍTULO */
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B71C1C",
    marginBottom: 10,
    textAlign: "center",
  },

  /* BANNER */
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

  /* LOADING */
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* CARD */
  card: {
    width: "47%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },

  /* TIPO SANGUÍNEO */
  type: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },

  /* STATUS */
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