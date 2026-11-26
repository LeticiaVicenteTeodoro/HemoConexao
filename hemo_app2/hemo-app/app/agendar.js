
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

const SITE_URL =
  "https://www.mg.gov.br/agendamento_servico/doacao-de-sangue";

export default function AgendarPage() {
  const [abrindo, setAbrindo] = useState(false);

  const abrirPortal = async () => {
    try {
      setAbrindo(true);

      await Linking.openURL(SITE_URL);
    } catch (erro) {
      console.log("ERRO AO ABRIR PORTAL:", erro);

      Alert.alert(
        "Não foi possível abrir",
        "Verifique sua conexão ou tente abrir o portal pelo navegador."
      );
    } finally {
      setAbrindo(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <FontAwesome
          name="arrow-left"
          size={18}
          color="#fff"
        />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <FontAwesome
          name="heart"
          size={65}
          color="#E30613"
        />

        <Text style={styles.title}>
          Agende sua doação
        </Text>

        <Text style={styles.description}>
          Para realizar seu agendamento, acesse o portal
          oficial do Governo de Minas Gerais.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={abrirPortal}
          disabled={abrindo}
        >
          {abrindo ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome
                name="external-link"
                size={18}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                Acessar agendamento
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          O portal será aberto no navegador do seu celular.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  backButton: {
    height: 55,
    backgroundColor: "#E30613",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginTop: 25,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 15,
    marginBottom: 30,
  },

  button: {
    width: "100%",
    minHeight: 55,
    backgroundColor: "#E30613",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  note: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
