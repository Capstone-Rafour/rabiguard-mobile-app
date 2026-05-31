import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { auth, db } from "../lib/firebase";

export default function SetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (loading) return;

    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;

    if (!passwordRegex.test(password)) {
      setError("영문, 숫자를 포함하여 8 ~ 20자");
      return;
    }

    setError("");

    try {
      setLoading(true);

      const userCredential = await auth.createUserWithEmailAndPassword(
        email.trim(),
        password,
      );

      const user = userCredential.user;

      if (user) {
        const userData = {
          email: user.email,
          id: user.uid,
          name: email.split("@")[0],
          password_hash: "firebase_authenticated_user",
        };

        await db.collection("users").doc(user.uid).set(userData);
        console.log("🔥 파이어베이스 회원가입 및 DB 등록 성공:", userData);
      }
      setLoading(false);

      // 로그인 화면으로 이동
      router.replace({
        pathname: "/login",
        params: { isAutoLoggedIn: "false" },
      });
    } catch (e: any) {
      setLoading(false);
      console.error("회원가입 실패", e);

      if (
        e.code === "auth/email-already-in-check" ||
        e.code === "auth/email-already-in-use"
      ) {
        setError("이미 가입된 이메일 주소입니다.");
      } else if (e.code === "auth/weak-password") {
        setError("비밀번호가 너무 취약합니다.");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
            disabled={loading}
          >
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
              editable={!loading}
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
            className={`w-full h-14 bg-[#5D60F1] rounded-xl justify-center items-center mt-6 ${
              password && !error && !loading ? "bg-[#5D60F1]" : "bg-gray-400"
            }`}
            onPress={handleComplete}
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? "가입 처리 중..." : "확인"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
