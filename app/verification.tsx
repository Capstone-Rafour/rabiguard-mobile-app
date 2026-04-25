import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import ScreenContainer from "../components/screen-container";

export default function VerificationScreen() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRef = useRef<(TextInput | null)[]>(Array(6).fill(null));

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) return; // 한 글자만 입력 허용

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // 다음 입력으로 포커스 이동
    if (text && index < 5) {
      inputRef.current[index + 1]?.focus();
    }

    const isComplete = newCode.every((digit) => digit !== "");
    if (isComplete) {
      router.push("/set-password");
    }
  };

  return (
    <ScreenContainer>
      <View className="px-6 pt-4 flex-1">
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold mb-4">인증번호</Text>

        {/* 6자리 입력 필드 */}
        <View className="flex-row justify-between gap-x-2 mb-10">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el: TextInput | null) => {
                inputRef.current[index] = el;
              }}
              className="w-14 h-14 bg-gray-200 rounded-xl text-center text-2xl font-bold"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
            />
          ))}
        </View>

        <Text className="text-gray-600 mb-8">
          인증번호를 메일로 전송했습니다.
        </Text>

        {/* 재전송 버튼 */}
        <TouchableOpacity className="" onPress={() => console.log("재전송")}>
          <Text className="text-[#5D60F1] text-base">재전송</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
