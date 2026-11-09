import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const API_URL =
  "https://hemo-backend-683937879829.us-central1.run.app";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalSangue, setModalSangue] = useState(false);

  const cadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );

      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const response = await fetch(
        `${API_URL}/usuario/firebase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_token: idToken,
            nome: nome.trim(),
            tipo_sanguineo: tipo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        Alert.alert(
          "Erro",
          data.mensagem ||
            "Não foi possível salvar os dados do usuário."
        );
        return;
      }

      await sendEmailVerification(user);

      Alert.alert(
        "Cadastro realizado",
        "Enviamos um link de confirmação para seu e-mail."
      );

      router.push({
        pathname: "/confirmar",
        params: { email: email.trim() },
      });
    } catch (error) {
      console.log("ERRO FIREBASE/BACKEND:", error);

      let mensagem = "Não foi possível criar a conta.";

      if (error.code === "auth/email-already-in-use") {
        mensagem = "Este e-mail já está cadastrado.";
      } else if (error.code === "auth/invalid-email") {
        mensagem = "Digite um e-mail válido.";
      } else if (error.code === "auth/weak-password") {
        mensagem = "A senha precisa ter pelo menos 6 caracteres.";
      } else if (error.code === "auth/network-request-failed") {
        mensagem = "Verifique sua conexão com a internet.";
      }

      Alert.alert("Erro", mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        placeholder="Nome"
        placeholderTextColor="#777"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        selectionColor="#E30613"
      />

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
        selectionColor="#E30613"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#777"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!mostrarSenha}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.passwordInput}
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

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirmar senha"
          placeholderTextColor="#777"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!mostrarConfirmacao}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.passwordInput}
          selectionColor="#E30613"
        />

        <TouchableOpacity
          onPress={() =>
            setMostrarConfirmacao(!mostrarConfirmacao)
          }
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={
            mostrarConfirmacao
              ? "Ocultar confirmação da senha"
              : "Mostrar confirmação da senha"
          }
        >
          <Text style={styles.eyeText}>
            {mostrarConfirmacao ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CAMPO DE TIPO SANGUÍNEO - SEMPRE BRANCO */}
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setModalSangue(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.pickerText}>
          {tipo || "Tipo sanguíneo (opcional)"}
        </Text>

        <Text style={styles.pickerArrow}>
          ▼
        </Text>
      </TouchableOpacity>

      {/* MODAL DE TIPO SANGUÍNEO - SEMPRE BRANCO */}
      <Modal
        visible={modalSangue}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalSangue(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Tipo sanguíneo
            </Text>

            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.sangueOption,
                    {
                      backgroundColor:
                        tipo === item ? "#E30613" : "#FFFFFF",
                      borderColor:
                        tipo === item ? "#E30613" : "#DDDDDD",
                    },
                  ]}
                  onPress={() => {
                    setTipo(item);
                    setModalSangue(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.sangueOptionText,
                      {
                        color:
                          tipo === item ? "#FFFFFF" : "#222222",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={styles.cancelarModal}
              onPress={() => setModalSangue(false)}
            >
              <Text style={styles.cancelarModalText}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTÃO CADASTRAR */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={cadastrar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>
          Já possui conta? Entrar
        </Text>
      </TouchableOpacity>
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
    marginBottom: 25,
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
    marginBottom: 15,
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

  // CAMPO DE SELEÇÃO
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    marginBottom: 15,
    height: 55,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  pickerText: {
    fontSize: 15,
    color: "#222222",
  },

  pickerArrow: {
    fontSize: 14,
    color: "#222222",
  },

  // FUNDO DO MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  // CAIXA DO MODAL
  modalBox: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    color: "#222222",
  },

  // OPÇÕES SANGUÍNEAS
  sangueOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    marginBottom: 8,
    alignItems: "center",
  },

  sangueOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },

  cancelarModal: {
    marginTop: 10,
    padding: 12,
    alignItems: "center",
  },

  cancelarModalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222222",
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
    marginTop: 20,
    textAlign: "center",
    color: "#E30613",
    fontWeight: "bold",
  },
});
