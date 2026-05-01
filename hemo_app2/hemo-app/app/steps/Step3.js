import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";

export default function Step3() {
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
        padding: 20,
        opacity: fadeAnim,
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "#dc2626", marginBottom: 30 }}>
        Deseja receber notificações?
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/steps/Step4")}
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
        onPress={() => router.push("/steps/Step4")}
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