import ScreenContainer from "@/components/screen-container";
import { MOCK_DATA } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function EventClipScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const record = MOCK_DATA.find((item) => item.id === id) || MOCK_DATA[0];

  return (
    <ScreenContainer>
      {/* 헤더 영역 */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold">이벤트 클립</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-6 mt-4">
        {/* 비디오 플레이어 영역 */}
        <View className="rounded-[32px] overflow-hidden shadow-sm bg-black relative">
          {/* 실제 비디오 플레이어 컴포넌트로 교체 필요 */}
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000",
            }}
            className="w-full h-64 opacity-80"
            resizeMode="cover"
          />
          <View className="absolute inset-0 justify-center items-center">
            <TouchableOpacity className="w-16 h-16 bg-white/30 rounded-full justify-center items-center border border-white/50">
              <Ionicons name="play" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 날짜 및 시간 표시 영역 */}
        <View className="mt-2 items-center">
          <Text className="text-[16px] text-gray-800">{record.timestamp}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
