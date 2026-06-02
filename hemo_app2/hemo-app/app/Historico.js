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

import db, { createTables } from "./registros";

export default function Historico() {
  const navigation = useNavigation();

  const [dados, setDados] = useState([]);

  useEffect(() => {
    createTables();
    carregar();
  }, []);

  const carregar = () => {
    try {
      const resultado = db.getAllSync(`
        SELECT *
        FROM doacoes
        ORDER BY id DESC
      `);

      setDados(resultado);
    } catch (error) {
      console.log(error);
    }
  };

  const excluir = (id) => {
    Alert.alert(
      "Excluir",
      "Deseja remover este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: () => {
            db.runSync("DELETE FROM doacoes WHERE id = ?", [id]);
            carregar();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* SETA DE VOLTAR */}
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
            <Text style={styles.text}>📝 {item.observacao}</Text>
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