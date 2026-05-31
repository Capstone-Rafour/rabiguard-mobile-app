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
import { auth } from "../lib/firebase";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이메일 유효성 검사
  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleEmailNext = async () => {
    setError("");

    if (!email) {
      setError("이메일 주소를 입력해주세요");
      return;
    }

    if (!validateEmail(email)) {
      setError("유효한 이메일 주소를 입력해주세요");
      return;
    }

    try {
      setLoading(true);

      const signInMethods = await auth.fetchSignInMethodsForEmail(email.trim());

      if (signInMethods.length > 0) {
        setError("이미 가입된 이메일 주소입니다.");
        setLoading(false);
        return;
      }

      setError("");
      setLoading(false);
      router.push({
        pathname: "/verification",
        params: { email },
      });
    } catch (e: any) {
      setLoading(false);

      console.error(e);
      setError("계정 정보를 확인하는 중 오류가 발생했습니다.");
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

          <Text className="text-3xl font-bold mb-4">새로운 계정 만들기</Text>

          {/* 이메일 입력 창 */}
          <View className="space-y-4">
            <TextInput
              placeholder="이메일 주소"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError("");
              }}
              className={`w-full h-14 bg-gray-200 rounded-xl px-4 text-lg ${
                error ? "border border-red-500" : "border-transparent"
              }`}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ lineHeight: 19 }}
            />

            {/* 에러 메시지 영역 */}
            <View className="h-6 justify-center">
              {error ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
              ) : null}
            </View>
          </View>

          {/* 인증 코드 받기 버튼 */}
          <TouchableOpacity
            className={`w-full h-14 rounded-xl justify-center items-center mt-10 ${
              email && !error && !loading ? "bg-[#5D60F1]" : "bg-gray-400"
            }`}
            onPress={handleEmailNext}
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">인증 코드 받기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
