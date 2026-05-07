import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // 1. check local
        const seen = await AsyncStorage.getItem("onboarding_done");

        if (seen) {
          setShowOnboarding(false);
          return;
        }

        // 2. fallback backend (SQLite)
        const res = await fetch(
          "http://192.168.1.20:3000/user/user@email.com"
        );

        const user = await res.json();

        if (user) {
          // já existe no banco → marca localmente
          await AsyncStorage.setItem("onboarding_done", "true");
          setShowOnboarding(false);
        } else {
          // não existe → mostra onboarding
          setShowOnboarding(true);
        }
      } catch (err) {
        console.log("Erro onboarding check:", err);
        setShowOnboarding(true); // fallback seguro
      }
    };

    checkOnboarding();
  }, []);

  // 🚀 iniciar onboarding
  const startOnboarding = async () => {
    setShowOnboarding(false);
    router.push("/steps/Step1");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HemoConexão</Text>

      <View style={styles.grid}>
        <Item icon="plus" text="Registrar" />

        <Item
          icon="calendar"
          text="Agendar"
          link="https://www.mg.gov.br/agendamento_servico/doacao-de-sangue"
        />

        <Item icon="heart" text="Histórico" />

        <Item
          icon="question"
          text="Dúvidas"
          onPress={() => router.push("/FAQ")}
        />

        <Item
          icon="comments"
          text="Chat"
          onPress={() => router.push("/chat")}
        />

        <Item
          icon="map"
          text="Mapa"
          onPress={() => router.push("/map")}
        />

        <Item
          icon="tint"
          text="Estoque"
          onPress={() => router.push("/Stock")}
        />
      </View>

      {/* ONBOARDING MODAL */}
      <Modal visible={showOnboarding} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Bem-vinda ao HemoConexão ❤️
            </Text>

            <Text style={styles.modalText}>
              Vamos te guiar em 5 passos rápidos.
            </Text>

            <TouchableOpacity style={styles.button} onPress={startOnboarding}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ITEM */
function Item({ icon, text, link, route, onPress }) {
  const handlePress = async () => {
    if (onPress) return onPress();

    if (route) return router.push(route);

    if (link) {
      const supported = await Linking.canOpenURL(link);
      if (supported) await Linking.openURL(link);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <FontAwesome name={icon} size={24} color="#E30613" />
      <Text>{text}</Text>
    </TouchableOpacity>
  );
}

/* STYLES (igual ao seu) */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: {
    fontSize: 20,
    color: "#E30613",
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "30%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  modalText: {
    textAlign: "center",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#E30613",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});