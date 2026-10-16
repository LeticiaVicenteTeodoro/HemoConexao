
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../firebaseConfig";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recuperando, setRecuperando] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          "E-mail não confirmado",
          "Confirme seu e-mail antes de entrar no aplicativo."
        );

        router.push({
          pathname: "/confirmar",
          params: { email: user.email ?? email.trim() },
        });

        return;
      }

      Alert.alert("Sucesso", "Login realizado com sucesso!");
      router.replace("/Home");
    } catch (error) {
      console.log("ERRO LOGIN FIREBASE:", error);

      let mensagem = "Não foi possível fazer login.";

      if (error instanceof FirebaseError) {
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          mensagem = "E-mail ou senha inválidos.";
        } else if (error.code === "auth/invalid-email") {
          mensagem = "Digite um e-mail válido.";
        } else if (error.code === "auth/too-many-requests") {
          mensagem =
            "Muitas tentativas. Tente novamente mais tarde.";
        } else if (error.code === "auth/network-request-failed") {
          mensagem = "Verifique sua conexão com a internet.";
        }
      }

      Alert.alert("Erro", mensagem);
    } finally {
      setLoading(false);
    }
  };

  const recuperarSenha = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Recuperar senha",
        "Digite seu e-mail no campo acima para receber o link de recuperação."
      );
      return;
    }

    try {
      setRecuperando(true);

      await sendPasswordResetEmail(auth, email.trim());

     
Alert.alert(
  "Verifique seu e-mail",
  "Se o endereço estiver cadastrado, você receberá as instruções para redefinir sua senha. Confira sua caixa de entrada e também as pastas Spam, Lixo eletrônico ou Promoções. Se não encontrar, aguarde alguns minutos."
);

    } catch (error) {
      console.log("ERRO RECUPERAÇÃO DE SENHA:", error);

      let mensagem =
        "Não foi possível enviar o e-mail. Tente novamente.";

      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-email") {
          mensagem = "Digite um e-mail válido.";
        } else if (
          error.code === "auth/network-request-failed"
        ) {
          mensagem = "Verifique sua conexão com a internet.";
        } else if (
          error.code === "auth/too-many-requests"
        ) {
          mensagem =
            "Muitas tentativas. Tente novamente mais tarde.";
        }
      }

      Alert.alert("Recuperação de senha", mensagem);
    } finally {
      setRecuperando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HemoConexão</Text>

      <Text style={styles.subtitle}>
        Faça login para continuar
      </Text>

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#777777"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        selectionColor="#E30613"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#777777"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!mostrarSenha}
          style={styles.passwordInput}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor="#E30613"
        />

        <TouchableOpacity
          onPress={() => setMostrarSenha(!mostrarSenha)}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={
            mostrarSenha ? "Ocultar senha" : "Mostrar senha"
          }
        >
          <Text style={styles.eyeText}>
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.forgotButton}
        onPress={recuperarSenha}
        disabled={recuperando}
      >
        <Text style={styles.link}>
          {recuperando
            ? "Enviando e-mail..."
            : "Esqueci minha senha"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/cadastro")}>
        <Text style={styles.link}>
          Não possui conta? Cadastre-se
        </Text>
      </TouchableOpacity>

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
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E30613",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    marginTop: 8,
    color: "#555555",
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#222222",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    color: "#222222",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeText: {
    color: "#E30613",
    fontWeight: "bold",
    fontSize: 12,
  },
  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#E30613",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#E30613",
    fontWeight: "bold",
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777777",
  },
});
