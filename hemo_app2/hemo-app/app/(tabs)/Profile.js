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

import db from "../registros";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadDoacoes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadDoacoes();
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

  async function loadDoacoes() {
    try {
      const resultado = db.getFirstSync(`
        SELECT COUNT(*) as total FROM doacoes
      `);

      setUser((prev) => ({
        ...prev,
        doacoes: resultado.total,
      }));
    } catch (err) {
      console.log("Erro ao contar doações:", err);
    }
  }

  async function pickImage() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permissão negada para acessar a galeria");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      const updatedUser = { ...user, photo: uri };

      setUser(updatedUser);

      await AsyncStorage.setItem(
        "user_profile",
        JSON.stringify(updatedUser)
      );
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
      {/* AVATAR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholder}>
              <FontAwesome name="user" size={50} color="#aaa" />
            </View>
          )}

          <View style={styles.cameraIcon}>
            <FontAwesome name="camera" size={14} color="white" />
          </View>
        </TouchableOpacity>

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

/* ITEM */
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

/* STYLES */
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