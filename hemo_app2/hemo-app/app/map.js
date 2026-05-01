import { View, StyleSheet } from "react-native";

export default function MapScreen() {
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

  return (
    <View style={styles.container}>
      <MapView
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});