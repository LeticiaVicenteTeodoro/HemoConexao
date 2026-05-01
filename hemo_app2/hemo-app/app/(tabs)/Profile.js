import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Profile() {
  return (
    <View style={styles.container}>

      {/* FOTO + INFO */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>Letícia</Text>
        <Text style={styles.info}>Tipo sanguíneo: O+</Text>
      </View>

      {/* CARD INFO */}
      <View style={styles.card}>
        <Item icon="heart" label="Doações realizadas" value="3" />
        <Item icon="calendar" label="Última doação" value="12/03/2026" />
        <Item icon="map-marker" label="Cidade" value="Poços de Caldas" />
      </View>

      {/* BOTÃO */}
      <TouchableOpacity style={styles.button}>
        <FontAwesome name="edit" size={18} color="white" />
        <Text style={styles.buttonText}> Editar perfil</Text>
      </TouchableOpacity>

    </View>
  );
}

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
});