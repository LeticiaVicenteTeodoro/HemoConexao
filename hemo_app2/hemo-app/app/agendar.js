import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function WebViewPage() {
  return (
    <View style={styles.container}>

      {/* BOTÃO VOLTAR */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <FontAwesome
          name="arrow-left"
          size={18}
          color="#fff"
        />

        <Text style={styles.backText}>
          Voltar
        </Text>
      </TouchableOpacity>

      {/* SITE DE AGENDAMENTO */}
      <WebView
        source={{
          uri: "https://www.mg.gov.br/agendamento_servico/doacao-de-sangue",
        }}
        style={styles.webview}
        startInLoadingState
      />

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

  webview: {
    flex: 1,
  },
});
