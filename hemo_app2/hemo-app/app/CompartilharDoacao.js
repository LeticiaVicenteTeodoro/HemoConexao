import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { router, useLocalSearchParams } from "expo-router";

export default function CompartilharDoacao() {
  const cardRef = useRef();

  const {
    data,
    local,
    tipo,
    total,
    selo,
  } = useLocalSearchParams();

  const compartilhar = async () => {
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
      });

      const disponivel =
        await Sharing.isAvailableAsync();

      if (!disponivel) {
        Alert.alert(
          "Erro",
          "Compartilhamento não disponível neste dispositivo."
        );
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Não foi possível compartilhar."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View ref={cardRef} style={styles.card}>
        <Text style={styles.logo}>HemoConexão</Text>

        <Text style={styles.bigIcon}>🩸</Text>

        <Text style={styles.title}>
          Eu doei sangue!
        </Text>

        <Text style={styles.subtitle}>
          Uma doação pode salvar vidas ❤️
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.info}>
            📅 Data: {data}
          </Text>

          <Text style={styles.info}>
            📍 Local: {local}
          </Text>

          <Text style={styles.info}>
            🩸 Tipo sanguíneo: {tipo}
          </Text>

          <Text style={styles.info}>
            🏅 Selo: {selo}
          </Text>

          <Text style={styles.info}>
            ❤️ Total de doações: {total}
          </Text>
        </View>

        <Text style={styles.footer}>
          Doe sangue. Compartilhe vida.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={compartilhar}
      >
        <Text style={styles.buttonText}>
          Compartilhar conquista
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text style={styles.link}>
          Voltar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  card: {
    backgroundColor: "#E30613",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },

  logo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  bigIcon: {
    fontSize: 60,
    marginBottom: 10,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 10,
  },

  infoBox: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 18,
    padding: 15,
    marginTop: 15,
  },

  info: {
    color: "#333",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },

  footer: {
    color: "#fff",
    marginTop: 18,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#E30613",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    marginTop: 18,
    color: "#E30613",
    fontWeight: "bold",
  },
});