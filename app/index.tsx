import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FirstScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#5D60F1]">
      <View className="flex-1 px-8 justify-between py-10">
        {/* 상단 로고 및 앱 이름 */}
        <View className="items-center mt-20">
          {/* 로고 */}
          <View className="w-24 h-24 items-center justify-center">
            <Image
              source={require("@/assets/images/rabiguard-logo3.png")}
              className="w-full h-full rounded-3xl"
              resizeMode="contain"
            />
          </View>

          {/* 앱 이름 */}
          <Text className="text-white text-4xl font-extrabold mt-6 tracking-tight">
            Rabiguard
          </Text>
        </View>

        {/* 하단 버튼 */}
        <View className="w-full pb-10">
          {/* 로그인 버튼 */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="py-5 items-center"
            onPress={() => router.push("/login")}
          >
            <Text className="text-white/80 text-lg font-medium">
              기존 계정으로 로그인
            </Text>
          </TouchableOpacity>

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-white py-4 rounded-2xl items-center shadow-md active:bg-gray-100"
            onPress={() => router.push("/sign-up")}
          >
            <Text className="text-[#5D60F1] text-lg font-bold">
              새로운 계정 만들기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
