import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";

export default function Step4() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#dc2626",
        borderRadius: 20,
        opacity: fadeAnim,
      }}
    >
      <Text style={{ color: "white", fontSize: 20, marginBottom: 30, textAlign: "center" }}>
        Qual seu sexo biológico?
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/steps/Step5")}
        style={{
          backgroundColor: "white",
          paddingVertical: 12,
          borderRadius: 12,
          width: "100%",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#dc2626", textAlign: "center" }}>
          Feminino
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/steps/Step5")}
        style={{
          backgroundColor: "white",
          paddingVertical: 12,
          borderRadius: 12,
          width: "100%",
        }}
      >
        <Text style={{ color: "#dc2626", textAlign: "center" }}>
          Masculino
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}