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
import { auth } from "../firebaseConfig";


const API_URL = "https://hemo-backend-683937879829.us-central1.run.app";

export default function Historico() {
  const navigation = useNavigation();

  const [dados, setDados] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
  try {
    const user = auth.currentUser;


console.log("FIREBASE USER:", user);
console.log("FIREBASE UID:", user?.uid);
    if (!user) {
      Alert.alert("Erro", "Usuário não está autenticado.");
      return;
    }


    
    const responseUsuario = await fetch(
      `${API_URL}/usuario/firebase/${user.uid}`
    );

    const usuario = await responseUsuario.json();
    console.log("RESPOSTA BACKEND USUARIO:", usuario);

    if (!responseUsuario.ok || !usuario.sucesso) {
      Alert.alert(
        "Erro",
        usuario.mensagem || "Usuário não encontrado."
      );
      return;
    }

    const responseHistorico = await fetch(
      `${API_URL}/historico/${usuario.id}`
    );

    const resultado = await responseHistorico.json();

    if (!responseHistorico.ok) {
      Alert.alert("Erro", "Não foi possível carregar o histórico.");
      return;
    }

    setDados(resultado);
  } catch (error) {
    console.log("ERRO HISTÓRICO:", error);

    Alert.alert(
      "Erro",
      "Não foi possível carregar o histórico."
    );
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