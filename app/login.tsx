import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const savedData = await AsyncStorage.getItem("userData");

      if (savedData !== null) {
        const { email: savedEmail, password: savedPassword } =
          JSON.parse(savedData);

        if (email === savedEmail && password === savedPassword) {
          console.log("로그인 성공", { email, password });
          router.replace({
            pathname: "/home",
            params: { isAutoLoggedIn: "true" },
          });
        } else {
          alert("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
      }
    } catch (e) {
      alert("계정 정보를 불러오는데 실패했습니다. 다시 시도해주세요.");
    }
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

          <Text className="text-3xl font-bold mb-4">기존 계정으로 로그인</Text>

          {/* 이메일 입력 창 */}
          <View className="space-y-4">
            <TextInput
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              className="w-full h-14 bg-gray-200 rounded-xl px-4 text-lg"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* 비밀번호 입력 창 */}
            <TextInput
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              className="w-full h-14 bg-gray-200 rounded-xl px-4 text-lg mt-4"
              secureTextEntry
            />
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            className="w-full h-14 bg-[#5D60F1] rounded-xl justify-center items-center mt-12"
            onPress={handleLogin}
          >
            <Text className="text-white text-lg font-bold">
              기존 계정으로 로그인
            </Text>
          </TouchableOpacity>

          {/* 비밀번호 찾기 */}
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => router.push("/find-password")}
          >
            <Text className="text-[#5D60F1] text-base">비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
