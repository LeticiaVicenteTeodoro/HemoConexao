import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from "expo-router"; 

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HemoConexão</Text>

      <View style={styles.grid}>
        <Item icon="plus" text="Registrar" />

        <Item
          icon="calendar"
          text="Agendar"
          link="https://www.mg.gov.br/agendamento_servico/doacao-de-sangue"
        />

        <Item icon="heart" text="Histórico" />

        <Item icon="question" text="Dúvidas"  onPress={() => router.push("/FAQ")} />

        <Item 
          icon="comments" 
          text="Chat" 
          onPress={() => router.push("/chat")} 
        />
        <Item
          icon="map"
          text="Mapa"
          onPress={() => router.push("/map")}
        />
        <Item icon="tint" text="Estoque" onPress={() => router.push("/Stock")} />
      </View>
    </View>
  );
}

function Item({ icon, text, link, route, onPress }) {

  const handlePress = async () => {

    // 👉 se tiver onPress, usa ele primeiro
    if (onPress) {
      onPress();
      return;
    }

    // 👉 navegação interna via route
    if (route) {
      router.push(route);
      return;
    }

    // 👉 link externo
    if (link) {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        console.log("Não foi possível abrir o link");
      }
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <FontAwesome name={icon} size={24} color="#E30613" />
      <Text>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, color: '#E30613', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '30%',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15
  }
});