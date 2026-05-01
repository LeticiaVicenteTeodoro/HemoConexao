import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";

export default function Step1() {
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
        opacity: fadeAnim,
        backgroundColor: "white",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 70, color: "red", marginBottom: 20 }}>
        ❤
      </Text>

      <Text style={{ fontSize: 22, fontWeight: "600" }}>
        HemoConexão
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/steps/Step2")}
        style={{
          marginTop: 40,
          backgroundColor: "#dc2626",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
          width: "100%",
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Começar
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}