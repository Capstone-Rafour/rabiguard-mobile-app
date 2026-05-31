import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../lib/firebase";

export default function EditProfileScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;

  useFocusEffect(
    React.useCallback(() => {
      setPassword("");
      setPasswordError("");
      setNameError("");
    }, []),
  );

  // 사용자 정보 불러오기
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDoc = await db
            .collection("users")
            .doc(currentUser.uid)
            .get();
          if (userDoc.exists) {
            const userData = userDoc.data();

            setName(userData?.name || "");
          }
        }
      } catch (e) {
        console.error("기존 프로필 로드 실패:", e);
      }
    };
    loadUserData();
  }, []);

  // 닉네임과 비밀번호를 검사하는 함수
  const isFormValid =
    name.trim().length > 0 && (password === "" || passwordRegex.test(password));
  const handleUpdate = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    let hasError = false;
    setPasswordError("");
    setNameError("");

    // 닉네임 유효성 검사
    if (!name.trim()) {
      setNameError("닉네임을 입력해주세요");
      hasError = true;
    }

    // 비밀번호 유효성 검사
    if (password && !passwordRegex.test(password)) {
      setPasswordError("영문, 숫자를 포함하여 8 ~ 20자");
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      // 닉네임 변경 반영
      await db.collection("users").doc(currentUser.uid).update({
        name: name.trim(),
      });

      // 비밀번호 변경 반영
      if (password) {
        await currentUser.updatePassword(password);
      }

      setLoading(false);

      Alert.alert("", "회원 정보가 수정되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            setPassword("");
            router.back();
          },
        },
      ]);
    } catch (e: any) {
      setLoading(false);
      console.error("수정 실패", e);

      if (e.code === "auth/requires-recent-login") {
        Alert.alert(
          "보안 경고",
          "보안을 위해 다시 로그인 후 비밀번호를 변경해주세요.",
        );
      } else {
        Alert.alert("오류", "정보 수정에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-4">
          {/* 헤더 영역 */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.push("/my-page")}
              className="w-10 h-10 justify-center"
            >
              <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              회원정보 수정
            </Text>
            <View className="w-10" />
          </View>

          {/* 닉네임 입력 창 */}
          <View className="mb-4">
            <Text className="text-[14px] font-semibold text-gray-600 mb-2 ml-2">
              닉네임
            </Text>
            <TextInput
              placeholder="변경할 닉네임 입력"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError("");
              }}
              className={`w-full h-14 bg-gray-200 rounded-xl px-4 text-lg ${
                nameError ? "border border-red-500" : "border-transparent"
              }`}
              autoCapitalize="none"
              style={{ lineHeight: 19 }}
              editable={!loading}
            />
            <View className="h-6 justify-center">
              {passwordError ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {nameError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* 비밀번호 입력 창 */}
          <View className="mb-4">
            <Text className="text-[14px] font-semibold text-gray-600 mb-2 ml-2">
              새 비밀번호
            </Text>
            <TextInput
              placeholder="새 비밀번호 입력 (영문/숫자 8~20자)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              className={`w-full h-14 bg-gray-200 rounded-xl px-4 text-lg ${
                passwordError ? "border border-red-500" : "border-transparent"
              }`}
              secureTextEntry
              autoCapitalize="none"
              style={{ lineHeight: 19 }}
              editable={!loading}
            />
            <View className="h-6 justify-center">
              {passwordError ? (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {passwordError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity
            className={`w-full h-14 rounded-xl justify-center items-center mt-6 shadow-sm ${loading && isFormValid ? "bg-gray-400" : "bg-[#5D60F1]"}`}
            onPress={handleUpdate}
            disabled={!isFormValid || loading}
          >
            <Text className="text-white text-lg font-bold">변경사항 저장</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
