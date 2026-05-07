import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";
import onboardingData from "./onboardingData";

export default function Step2() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const continuar = () => {
    onboardingData.acceptedOnboarding = true;
    router.push("/steps/Step3");
  };

  const pular = () => {
    onboardingData.acceptedOnboarding = false;
    router.replace("/(tabs)/Home");
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
          fontSize: 20,
          fontWeight: "bold",
          color: "#dc2626",
          marginBottom: 16,
        }}
      >
        Olá, estou aqui pra te ajudar!
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#666",
          marginBottom: 30,
        }}
      >
        Gostaria de fazer algumas perguntas para deixar sua experiência ainda melhor.
      </Text>

      <TouchableOpacity
        onPress={continuar}
        style={{
          backgroundColor: "#dc2626",
          paddingVertical: 12,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Continuar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pular}>
        <Text style={{ textAlign: "center", color: "#999" }}>
          Talvez mais tarde
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}