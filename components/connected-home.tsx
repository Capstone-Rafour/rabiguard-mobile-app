import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ScreenContainer from "./screen-container";

export default function ConnectedHomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1 bg-gray-50/50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        {/* 상단 헤더 영역 */}
        <View className="flex-row justify-between items-center py-4 mb-8">
          <Text className="text-3xl font-bold">홈</Text>
          <TouchableOpacity
            className="w-10 h-10 bg-[#5D60F1] rounded-full justify-center items-center"
            onPress={() => router.push("/my-page")}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 연결된 카메라 상태 카드 */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-14 h-14 bg-green-50 rounded-2xl justify-center items-center">
              <Ionicons name="videocam" size={24} color="#22C55E" />
            </View>

            <View style={{ marginLeft: 14 }} className="flex-1 justify-center">
              <Text className="text-sm text-gray-400 font-medium mb-1">
                현재 연결된 기기
              </Text>
              <Text
                className="text-xl font-bold text-gray-800"
                numberOfLines={1}
              >
                거실 메인 카메라
              </Text>
            </View>

            <View className="bg-green-100 px-3 py-1.5 rounded-xl self-center">
              <Text className="text-green-700 text-xs font-bold">연결됨</Text>
            </View>
          </View>
        </View>

        {/* 24시간 이벤트 요약 카드 */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-400 text-l mb-1">
              지난 24시간 동안의
            </Text>
            <Text className="text-xl font-bold text-gray-800">이벤트 횟수</Text>

            <View className="flex-row items-baseline mt-3">
              <Text className="text-5xl font-extrabold text-[#FF6B6B]">5</Text>
              <Text className="text-lg font-bold text-gray-500 ml-1">회</Text>
            </View>
          </View>

          <View className="w-16 h-16 bg-[#FFF0F0] rounded-2xl justify-center items-center">
            <Ionicons name="alert-circle" size={32} color="#FF6B6B" />
          </View>
        </View>

        {/* 구역 설정 카드*/}
        <View className="bg-white rounded-3xl p-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-800 text-xl font-bold">구역 설정</Text>

            {/* 구역 설정 페이지로 이동 */}
            <TouchableOpacity
              className="w-8 h-8 justify-center items-center bg-gray-50 rounded-full"
              onPress={() => router.push("/area-setting")}
            >
              <Ionicons name="settings-outline" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-400 mb-6">
            이벤트를 인식할 구역을 설정합니다
          </Text>

          {/* 실시간 영상 보기 버튼 */}
          <TouchableOpacity
            className="w-full h-14 bg-[#5D60F1] rounded-2xl flex-row justify-center items-center"
            activeOpacity={0.8}
            onPress={async () => {
              try {
                await firestore().collection("commands").add({
                  type: "start_stream",
                  created_at: firestore.FieldValue.serverTimestamp(),
                });
                console.log("start_stream 명령 전송 완료");
                router.push("/(tabs)/streaming");
              } catch (e) {
                console.warn("start_stream 명령 전송 실패:", e);
              }
            }}
          >
            <Ionicons
              name="play-circle"
              size={22}
              color="white"
              className="mr-2"
            />
            <Text className="text-white font-bold text-lg">
              실시간 영상 보기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
