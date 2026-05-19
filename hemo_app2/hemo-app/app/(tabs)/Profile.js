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
import { useFocusEffect } from "@react-navigation/native"; // 🔥 ADICIONADO

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  // 🔥 NOVO: atualiza sempre que voltar pra tela
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    try {
      const data = await AsyncStorage.getItem("user_profile");

      if (data) {
        setUser(JSON.parse(data));
      }
    } catch (err) {
      console.log("Erro ao carregar usuário:", err);
    }
  }

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem("user_profile");
      await AsyncStorage.removeItem("onboarding_done");
      router.replace("/");
    } catch (err) {
      console.log("Erro ao sair:", err);
    }
  }

  return (
    <View style={styles.container}>
      {/* FOTO + INFO */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {user?.email?.split("@")[0] || "Usuário"}
        </Text>

        <Text style={styles.info}>
          Tipo sanguíneo: {user?.tipo_sanguineo || "--"}
        </Text>

        <Text style={styles.info}>
          Sexo: {user?.sexo || "--"}
        </Text>
      </View>

      {/* CARD INFO */}
      <View style={styles.card}>
        <Item
          icon="heart"
          label="Doações realizadas"
          value={user?.doacoes || "0"}
        />

        <Item
          icon="calendar"
          label="Última doação"
          value={user?.ultima_doacao || "Nunca"}
        />

        <Item
          icon="map-marker"
          label="Cidade"
          value={user?.cidade || "Poços de Caldas"}
        />
      </View>

      {/* EDITAR PERFIL */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/EditProfile")}
      >
        <FontAwesome name="edit" size={18} color="white" />
        <Text style={styles.buttonText}> Editar perfil</Text>
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={18} color="white" />
        <Text style={styles.logoutText}> Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

/* COMPONENTE ITEM */
function Item({ icon, label, value }) {
  return (
    <View style={styles.item}>
      <FontAwesome name={icon} size={18} color="#E30613" />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#E30613",
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
  },

  info: {
    color: "#666",
    marginTop: 4,
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