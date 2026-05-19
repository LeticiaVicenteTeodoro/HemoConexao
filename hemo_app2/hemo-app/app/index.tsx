import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

type GoogleUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

export default function Index() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Gera automaticamente o redirect URI.
   * Para web, normalmente será http://localhost:8081
   * Para mobile, usará o scheme definido no app.json.
   */
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "googlelogintest",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "608440626129-g99fv30v4t72j54r3nebh9kok1iul69m.apps.googleusercontent.com",

  androidClientId:
    "608440626129-a0qnlup05jscfurtp9mup9sb349lg70c.apps.googleusercontent.com",
    
    redirectUri,
  });

  /**
   * Processa a resposta do Google após login
   */
  useEffect(() => {
    const fetchUser = async () => {
      if (response?.type !== "success") return;

      try {
        setLoading(true);

        const token = response.authentication?.accessToken;

        if (!token) {
          Alert.alert("Erro", "Token não encontrado.");
          return;
        }

        const res = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: GoogleUser = await res.json();

        console.log("USUÁRIO GOOGLE:", data);

        // Salva dados no estado
        setUser(data);
        setEmail(data.email);

        Alert.alert(
          "Login realizado",
          `Bem-vindo(a), ${data.name}!`
        );

        // Navega para a Home
        router.replace("/Home");
      } catch (error) {
        console.log("Erro:", error);
        Alert.alert("Erro", String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [response]);

  /**
   * Login tradicional (temporário)
   */
  const handleLogin = () => {
    router.replace("/Home");
  };

  /**
   * Inicia o login com Google
   */
  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.log("Erro ao abrir login Google:", error);
      Alert.alert(
        "Erro",
        "Não foi possível iniciar o login com Google."
      );
    }
  };

  /**
   * Logout local
   */
  const handleSignOut = () => {
    setUser(null);
    setEmail("");
    Alert.alert("Logout", "Usuário desconectado.");
  };

  return (
    <View style={styles.container}>
      {/* TÍTULO */}
      <Text style={styles.title}>HemoConexão</Text>

      <Text style={styles.subtitle}>
        Faça login para continuar
      </Text>

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* SENHA */}
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* LOGIN NORMAL */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* LOGIN COM GOOGLE */}
      <TouchableOpacity
        style={[
          styles.googleButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleGoogleLogin}
        disabled={!request || loading}
      >
        <Text style={styles.googleButtonText}>
          {loading
            ? "Conectando..."
            : "Entrar com Google"}
        </Text>
      </TouchableOpacity>

      {/* LOGOUT (opcional para testes) */}
      {user && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      )}

      {/* RODAPÉ */}
      <Text style={styles.footerText}>
        Doe sangue, salve vidas ❤️
      </Text>
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
    marginBottom: 5,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#E30613",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  googleButton: {
    backgroundColor: "#4285F4",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  googleButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  logoutButton: {
    backgroundColor: "#777",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.7,
  },

  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 12,
  },
});