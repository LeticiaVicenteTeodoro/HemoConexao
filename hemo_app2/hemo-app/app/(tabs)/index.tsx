import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

      {/* 📸 IMAGEM */}
      <Image
        
        style={{ width: 200, height: 200, marginBottom: 20 }}
        resizeMode="contain"
      />

      <Text>Home</Text>

      <TouchableOpacity
        onPress={() => router.push("../steps/Step1")}
        style={{
          marginTop: 20,
          backgroundColor: "#E30613",
          padding: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>Iniciar onboarding</Text>
      </TouchableOpacity>
    </View>
  );
}