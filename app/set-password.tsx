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

export default function SetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleComplete = () => {
    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
    if (!passwordRegex.test(password)) {
      setError("영문, 숫자를 포함하여 8 ~ 20자");
      return;
    }

    setError("");
    router.push("/home");
  };

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

          <Text className="text-3xl font-bold mb-4">비밀번호 만들기</Text>

          {/* 비밀번호 입력 창 */}
          <View className="space-y-4">
            <TextInput
              placeholder="비밀번호"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError("");
              }}
              className={`w-full h-14 bg-gray-200 rounded-xl px-4 text-lg ${error ? "border border-red-500" : ""}`}
              secureTextEntry // 비밀번호 입력 시 글자 숨김
              autoCapitalize="none"
            />
          </View>

          {/* 에러 메시지 */}
          <View className="h-6 justify-center">
            {error ? (
              <Text className="text-red-500 text-sm mt-1">{error}</Text>
            ) : null}
          </View>

          {/* 완료 버튼 */}
          <TouchableOpacity
            className="w-full h-14 bg-[#5D60F1] rounded-xl justify-center items-center mt-6"
            onPress={handleComplete}
          >
            <Text className="text-white text-lg font-bold">확인</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
