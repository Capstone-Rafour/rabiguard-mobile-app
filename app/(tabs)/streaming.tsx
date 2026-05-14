import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
// 나중에 백엔드 주소로 교체할 부분 (예: http://your-ip:port/stream.m3u8)
const videoSource = "https://www.w3schools.com/html/mov_bbb.mp4";

export default function StreamingScreen() {
  const router = useRouter();

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  // 로딩 여부 판단
  const isLoading = !player.status || player.status === "loading";

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
        <Text className="text-[18px] font-bold">실시간 스트리밍</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-6 mt-4">
        {/* 비디오 플레이어 영역 */}
        <View className="rounded-[32px] overflow-hidden shadow-lg bg-black relative h-64">
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            nativeControls={false}
          />

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <ActivityIndicator size="large" color="#5D60F1" />
            </View>
          )}

          {/* 스트리밍 전용 오버레이 (LIVE 배지 등) */}
          <View className="absolute top-5 left-5 bg-red-600 px-3 py-1 rounded-full flex-row items-center">
            <View className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            <Text className="text-white text-[12px] font-bold">LIVE</Text>
          </View>
        </View>

        {/* 하단 정보 영역 */}
        <View className="mt-6 space-y-4">
          <View className="flex-row justify-between items-center bg-gray-100 p-5 rounded-2xl">
            <View>
              <Text className="text-gray-500 text-xs">연결된 기기</Text>
              <Text className="text-lg font-bold">거실 메인 카메라</Text>
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-lg">
              <Text className="text-green-600 font-bold text-xs">연결됨</Text>
            </View>
          </View>

          {/* 추가 컨트롤 버튼들 (캡처, 소리 등) */}
          <View className="flex-row justify-around py-4">
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mb-2">
                <Ionicons name="camera" size={24} color="#555" />
              </View>
              <Text className="text-xs text-gray-600">스냅샷</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mb-2">
                <Ionicons name="mic" size={24} color="#555" />
              </View>
              <Text className="text-xs text-gray-600">말하기</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mb-2">
                <Ionicons name="volume-medium" size={24} color="#555" />
              </View>
              <Text className="text-xs text-gray-600">소리</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
