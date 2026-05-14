import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

const MOCK_DEVICES = [
  {
    id: "1",
    name: "거실 메인 카메라",
    model: "AI-Cam-V2",
    status: "online",
    lastSync: "2026.05.14",
  },
  {
    id: "2",
    name: "현관 입구 카메라",
    model: "AI-Cam-V1",
    status: "offline",
    lastSync: "2026.05.12",
  },
];

export default function DeviceManagementScreen() {
  const router = useRouter();

  const handleDelete = (deviceName: string) => {
    Alert.alert("기기 삭제", `${deviceName}를 계정에서 해제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => console.log(`${deviceName} 삭제 로직 실행`),
      },
    ]);
  };

  return (
    <ScreenContainer>
      {/* 헤더 */}
      <View className="flex-row items-center mb-6 px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-3 text-gray-900">기기 관리</Text>
      </View>

      {/* ScrollView를 사용하면 내부 콘텐츠만큼만 높이를 차지합니다 */}
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {MOCK_DEVICES.map((item) => (
          <View
            key={item.id}
            className="p-5 mb-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  {item.name}
                </Text>
                <Text className="text-gray-400 text-sm">{item.model}</Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${item.status === "online" ? "bg-blue-100" : "bg-gray-200"}`}
              >
                <Text
                  className={`text-xs font-medium ${item.status === "online" ? "text-blue-600" : "text-gray-500"}`}
                >
                  {item.status === "online" ? "연결됨" : "연결 끊김"}
                </Text>
              </View>
            </View>

            <View className="h-[1px] bg-gray-200 my-3" />

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 text-xs italic">
                최근 동기화: {item.lastSync}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.name)}
                className="bg-red-50 px-3 py-1.5 rounded-xl"
              >
                <Text className="text-red-500 text-xs font-semibold">
                  기기 해제
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* 버튼이 ScrollView 안에 있으므로 마지막 아이템 바로 밑에 붙고, 함께 스크롤됩니다 */}
        <TouchableOpacity
          className="bg-[#5D60F1] h-14 rounded-2xl flex-row items-center justify-center shadow-md mb-10 mt-4"
          onPress={() => Alert.alert("안내", "새로운 기기를 검색합니다.")}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">
            새 기기 등록하기
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
