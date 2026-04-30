import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ScreenContainer from "../components/screen-container";

export default function FindPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="px-6 pt-4">
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold mb-4">비밀번호 찾기</Text>

          {/* 이메일 입력 창 */}
          <View className="space-y-4">
            <TextInput
              placeholder="이메일 주소"
              value={email}
              onChangeText={setEmail}
              className="w-full h-14 bg-gray-200 rounded-xl px-4 text-lg"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* 인증 코드 받기 버튼 */}
          <TouchableOpacity
            className="w-full h-14 bg-[#5D60F1] rounded-xl justify-center items-center mt-12"
            onPress={() => router.push("/verification")}
          >
            <Text className="text-white text-lg font-bold">인증 코드 받기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
