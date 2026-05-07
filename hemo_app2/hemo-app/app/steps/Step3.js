import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";
import onboardingData from "./onboardingData";

export default function Step3() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const aceitar = () => {
    onboardingData.notifications = true;
    router.push("/steps/Step4");
  };

  const recusar = () => {
    onboardingData.notifications = false;
    router.push("/steps/Step4");
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        opacity: fadeAnim,
        backgroundColor: "white",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#dc2626",
          marginBottom: 30,
        }}
      >
        Deseja receber notificações?
      </Text>

      <TouchableOpacity
        onPress={aceitar}
        style={{
          backgroundColor: "#dc2626",
          paddingVertical: 12,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Sim
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={recusar}
        style={{
          backgroundColor: "#dc2626",
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Agora não
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}