import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

{
  /* 임시 데이터 - 실제 데이터로 교체 필요 */
}
const MOCK_DATA = [
  {
    id: "1",
    location: "소파",
    description: "체류 시간 15분 / 1명",
    timestamp: "12:30",
  },
  { id: "2", location: "식탁", description: "이벤트 감지", timestamp: "11:45" },
  { id: "3", location: "침대", description: "움직임 없음", timestamp: "10:20" },
  { id: "4", location: "현관", description: "출입 감지", timestamp: "09:15" },
  {
    id: "5",
    location: "부엌",
    description: "체류 시간 5분 / 2명",
    timestamp: "08:50",
  },
  {
    id: "6",
    location: "소파",
    description: "체류 시간 30분 / 1명",
    timestamp: "07:30",
  },
  { id: "7", location: "서재", description: "이벤트 감지", timestamp: "06:10" },
  { id: "8", location: "거실", description: "움직임 감지", timestamp: "05:00" },
  { id: "9", location: "화장실", description: "출입 감지", timestamp: "03:45" },
  { id: "10", location: "침대", description: "취침 시작", timestamp: "01:20" },
];

export default function RecordScreen() {
  const [filter, setFilter] = useState("시간순");

  const renderItem = ({ item }: { item: (typeof MOCK_DATA)[0] }) => (
    <TouchableOpacity className="flex-row items-center justify-between py-4 px-2 border-b border-gray-100">
      <View>
        <Text className="text-lg font-bold text-gray-800">{item.location}</Text>
        <Text className="text-sm text-gray-400">{item.description}</Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-sm text-gray-400 mr-2">{item.timestamp}</Text>
        <Ionicons name="chevron-forward" size={18} color="#D1D1D6" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <View className="flex-1 px-6">
        {/* 상단 헤더 영역 */}
        <View className="flex-row justify-between items-center py-4 mb-8">
          <Text className="text-3xl font-bold">기록</Text>
          <TouchableOpacity
            className="w-10 h-10 bg-[#5D60F1] rounded-full justify-center items-center"
            onPress={() => console.log("마이페이지 이동")}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 드롭다운 버튼 영역 */}
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            className="flex-row items-center px-3 py-2 rounded-lg"
            onPress={() => {
              // TODO: 필터 선택 기능 추가 예정
            }}
          >
            <Text className="text-[#5D60F1] font-semibold mr-1">{filter}</Text>
            <Ionicons name="swap-vertical" size={14} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* 기록 리스트 영역 */}
        <View className="flex-1 bg-white rounded-3xl shadow-sm mb-24 px-4">
          <FlatList
            data={MOCK_DATA}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
