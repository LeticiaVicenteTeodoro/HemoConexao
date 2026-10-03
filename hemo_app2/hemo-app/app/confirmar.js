
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { reload } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Confirmar() {
  const { email } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        Alert.alert(
          "Erro",
          "Não encontramos sua conta. Faça o cadastro novamente."
        );
        return;
      }

      // Atualiza os dados do usuário vindos do Firebase
      await reload(user);

      if (auth.currentUser?.emailVerified) {
        Alert.alert(
          "Sucesso",
          "Email confirmado com sucesso!"
        );

        router.replace("/");
      } else {
        Alert.alert(
          "Email ainda não confirmado",
          "Clique no link enviado para seu email e depois tente novamente."
        );
      }
    } catch (error) {
      console.log("ERRO AO CONFIRMAR:", error);

      Alert.alert(
        "Erro",
        "Não foi possível verificar a confirmação do email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Email</Text>

      <Text style={styles.subtitle}>
        Enviamos um link de confirmação para:
        
      </Text>

      <Text style={styles.email}>{email}</Text>

      <Text style={styles.instruction}>
  Caso não encontre o email na caixa de entrada, verifique também a pasta de spam ou lixo eletrônico.
</Text>

      <Text style={styles.instruction}>
        Abra seu email, clique no link de confirmação e depois
        volte para o aplicativo.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={confirmar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verificando..." : "Já confirmei meu email"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.link}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E30613",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "#555",
  },

  email: {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 20,
  },

  instruction: {
    textAlign: "center",
    color: "#555",
    lineHeight: 22,
    marginBottom: 25,
  },

  button: {
    backgroundColor: "#E30613",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#E30613",
    fontWeight: "bold",
  },
});