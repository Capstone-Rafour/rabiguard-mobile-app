import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ScreenContainer from "./screen-container";

export default function ConnectedHomeScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 px-6">
        {/* 상단 헤더 영역 */}
        <View className="flex-row justify-between items-center py-4 mb-8">
          <Text className="text-3xl font-bold">홈</Text>
          <TouchableOpacity
            className="w-10 h-10 bg-[#5D60F1] rounded-full justify-center items-center"
            onPress={() => console.log("마이페이지 이동")}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {/* 24시간 이벤트 요약 카드 */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <Text className="text-3xl font-bold leading-7">
            지난 24시간 동안의 {"\n"}이벤트 횟수
          </Text>
          <Text className="text-8xl font-black text-red-500 opacity-80 mt-2">
            5
          </Text>
        </View>

        {/* 구역 설정 카드*/}
        <View className="bg-white rounded-3xl p-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">구역 설정</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-gray-400 mr-1">Detail</Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D1D6" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 mb-6">
            이벤트를 인식할 구역을 설정합니다
          </Text>
          <TouchableOpacity className="items-center py-2">
            <Text className="text-blue-500 font-semibold text-lg">
              실시간 영상 보기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
