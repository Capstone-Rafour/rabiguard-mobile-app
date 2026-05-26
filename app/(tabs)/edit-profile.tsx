import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      setPassword("");
      setPasswordError("");
    }, []),
  );
  // 사용자 정보 불러오기
  useEffect(() => {
    const loadUserData = async () => {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const user = JSON.parse(data);
      }
    };
    loadUserData();
  }, []);

  const handleUpdate = async () => {
    let hasError = false;

    // 비밀번호 유효성 검사
    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
    if (password && !passwordRegex.test(password)) {
      setPasswordError("영문, 숫자를 포함하여 8 ~ 20자");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const user = JSON.parse(data);

        // 새로운 값으로 업데이트(입력 안 했으면 기존 값 유지)
        const updateUser = {
          ...user,
          password: password,
        };

        await AsyncStorage.setItem("userData", JSON.stringify(updateUser));

        Alert.alert("", "비밀번호가 수정되었습니다.", [
          {
            text: "확인",
            onPress: () => {
              setPassword("");
              router.back();
            },
          },
        ]);
      }
    } catch (e) {
      console.error("수정 실패", e);
      Alert.alert("비밀번호 수정에 실패했습니다. 다시 시도해주세요.");
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
              비밀번호 수정
            </Text>
            <View className="w-10" />
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
            className="w-full h-14 bg-[#5D60F1] rounded-xl justify-center items-center mt-6 shadow-sm"
            onPress={handleUpdate}
          >
            <Text className="text-white text-lg font-bold">변경사항 저장</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
