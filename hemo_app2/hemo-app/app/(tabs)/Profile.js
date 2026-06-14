import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://192.168.1.20:8000";

const MARCOS = [1, 5, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100];

function calcularMarco(total) {
  const marcoAtual = MARCOS.filter((m) => total >= m).pop() || 0;
  const proximoMarco = MARCOS.find((m) => total < m) || null;

  return {
    marcoAtual,
    proximoMarco,
    faltam: proximoMarco ? proximoMarco - total : 0,
  };
}

function nomeDoMarco(marco) {
  if (marco >= 100) return "Herói da Vida";
  if (marco >= 75) return "Lenda Solidária";
  if (marco >= 50) return "Doador Ouro";
  if (marco >= 35) return "Doador Experiente";
  if (marco >= 25) return "Doador Prata";
  if (marco >= 15) return "Doador Frequente";
  if (marco >= 5) return "Doador Iniciante";
  if (marco >= 1) return "Primeira Doação";

  return "Novo Doador";
}

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("usuario");

      if (!usuarioSalvo) {
        router.replace("/");
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      const response = await fetch(
        `${API_URL}/historico/${usuario.id}`
      );

      const historico = await response.json();

      const fotoSalva = await AsyncStorage.getItem("foto_perfil");

      setUser({
        ...usuario,
        photo: fotoSalva,
        doacoes: historico.length,
      });
    } catch (err) {
      console.log("Erro ao carregar usuário:", err);
    }
  }

  async function pickImage() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permissão negada para acessar a galeria");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      await AsyncStorage.setItem("foto_perfil", uri);

      setUser((prev) => ({
        ...prev,
        photo: uri,
      }));
    }
  }

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem("usuario");
      await AsyncStorage.removeItem("foto_perfil");
      await AsyncStorage.removeItem("onboarding_done");

      router.replace("/");
    } catch (err) {
      console.log("Erro ao sair:", err);
    }
  }

  const total = user?.doacoes || 0;
  const { marcoAtual, proximoMarco, faltam } = calcularMarco(total);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.avatarContainer}
        >
          {user?.photo ? (
            <Image
              source={{ uri: user.photo }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.placeholder}>
              <FontAwesome
                name="user"
                size={50}
                color="#aaa"
              />
            </View>
          )}

          <View style={styles.cameraIcon}>
            <FontAwesome
              name="camera"
              size={14}
              color="white"
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>
          {user?.nome || "Usuário"}
        </Text>

        <Text style={styles.info}>
          {user?.email || "email não informado"}
        </Text>
      </View>

      <View style={styles.gamificationCard}>
        <Text style={styles.gamificationTitle}>
          🩸 Jornada de doações
        </Text>

        <Text style={styles.gamificationText}>
          Total de doações: {total}
        </Text>

        <Text style={styles.badge}>
          🏅 {nomeDoMarco(marcoAtual)}
        </Text>

        {proximoMarco ? (
          <Text style={styles.nextGoal}>
            Faltam {faltam} doação(ões) para o marco de {proximoMarco}.
          </Text>
        ) : (
          <Text style={styles.nextGoal}>
            Você alcançou o maior marco de doações!
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Item
          icon="heart"
          label="Doações realizadas"
          value={total}
        />

        <Item
          icon="envelope"
          label="E-mail"
          value={user?.email || "--"}
        />

        <Item
          icon="trophy"
          label="Selo atual"
          value={nomeDoMarco(marcoAtual)}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/EditProfile")}
      >
        <FontAwesome name="edit" size={18} color="white" />
        <Text style={styles.buttonText}> Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <FontAwesome
          name="sign-out"
          size={18}
          color="white"
        />
        <Text style={styles.logoutText}> Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

function Item({ icon, label, value }) {
  return (
    <View style={styles.item}>
      <FontAwesome
        name={icon}
        size={18}
        color="#E30613"
      />

      <View style={{ marginLeft: 10 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#E30613",
  },

  placeholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E30613",
  },

  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#E30613",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
  },

  info: {
    color: "#666",
    marginTop: 4,
  },

  gamificationCard: {
    backgroundColor: "#fff0f0",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ffd0d0",
    marginBottom: 15,
  },

  gamificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E30613",
    marginBottom: 8,
  },

  gamificationText: {
    fontSize: 14,
    marginBottom: 5,
  },

  badge: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },

  nextGoal: {
    fontSize: 13,
    color: "#666",
  },

  card: {
    backgroundColor: "#f7f7f7",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    color: "#888",
  },

  value: {
    fontSize: 14,
    fontWeight: "bold",
  },

  button: {
    flexDirection: "row",
    backgroundColor: "#E30613",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
});