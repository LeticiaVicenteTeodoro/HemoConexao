import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.20:8000";

export default function Historico() {
  const navigation = useNavigation();

  const [dados, setDados] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("usuario");

      if (!usuarioSalvo) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      const response = await fetch(
        `${API_URL}/historico/${usuario.id}`
      );

      const resultado = await response.json();

      setDados(resultado);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar o histórico.");
    }
  };

  const excluir = (id) => {
    Alert.alert(
      "Excluir",
      "A exclusão ainda não está conectada ao backend.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Histórico de Doações</Text>

      <FlatList
        data={dados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onLongPress={() => excluir(item.id)}
          >
            <Text style={styles.text}>📅 {item.data}</Text>
            <Text style={styles.text}>🏥 {item.local}</Text>
            <Text style={styles.text}>🩸 {item.tipo}</Text>
            <Text style={styles.text}>
              📝 {item.observacao || "Sem observações"}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhuma doação registrada.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  backText: {
    color: "#E30613",
    fontSize: 28,
    fontWeight: "bold",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  text: {
    marginBottom: 3,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "gray",
  },
});