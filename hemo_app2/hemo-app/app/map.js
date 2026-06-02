import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Text,
  Linking,
  Platform
} from "react-native";

import MapView, { Marker } from "react-native-maps";
import { useRef } from "react";

export default function MapScreen() {
  const mapRef = useRef(null);

  const centers = [
    {
      id: 1,
      title: "Hemocentro Poços de Caldas",
      latitude: -21.7876,
      longitude: -46.5614,
    },
    {
      id: 2,
      title: "Hemominas Pouso Alegre",
      latitude: -22.2306,
      longitude: -45.9367,
    },
  ];

  // 📍 Centraliza o mapa
  const goToLocation = (item) => {
    mapRef.current.animateToRegion({
      latitude: item.latitude,
      longitude: item.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  // 🚗 Abrir rota no Google Maps
  const openRoute = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      console.log("Erro ao abrir o Google Maps");
    });
  };

  // ⚠️ Evita erro no navegador
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Text>Mapa não disponível no navegador</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: -21.7876,
          longitude: -46.5614,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {centers.map((c) => (
          <Marker
            key={c.id}
            coordinate={{
              latitude: c.latitude,
              longitude: c.longitude,
            }}
            title={c.title}
          />
        ))}
      </MapView>

    
      <FlatList
        data={centers}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            
            <TouchableOpacity onPress={() => goToLocation(item)}>
              <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>

           
            <TouchableOpacity
              style={styles.button}
              onPress={() => openRoute(item.latitude, item.longitude)}
            >
              <Text style={styles.buttonText}>Ver rota</Text>
            </TouchableOpacity>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },

  map: {
    flex: 2,
  },

  list: {
    flex: 1,
    backgroundColor: "#fff",
  },

  card: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  button: {
    marginTop: 8,
    backgroundColor: "#E30613",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});