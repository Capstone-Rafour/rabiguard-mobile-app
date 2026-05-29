import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MOCK_DATA, RecordItem } from "../../constants/data";

export default function RecordSubListScreen() {
  const router = useRouter();
  const { title, filterType } = useLocalSearchParams<{
    title: string;
    filterType: string;
  }>();
  const key = filterType === "구역" ? "location" : "eventType";
  const filteredItems = (MOCK_DATA as RecordItem[]).filter(
    (item) => item[key as keyof RecordItem] === title,
  );

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-4">
        {/* 상단 헤더 영역 */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">{title}</Text>
          <View className="w-10" />
        </View>

        {/* 필터링된 실제 하위 기록 리스트 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <Text className="text-gray-400 font-medium mb-3 ml-1">
            {filterType}별 상세 기록 ({filteredItems.length})
          </Text>

          <View className="bg-white rounded-[32px] px-4 shadow-sm border border-gray-50">
            {filteredItems.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center justify-between py-5 ${idx !== filteredItems.length - 1 ? "border-b border-gray-50" : ""}`}
                onPress={() => router.push(`/record-detail/${item.id}` as any)}
              >
                <View className="flex-1">
                  <Text className="text-[17px] font-bold text-gray-800 mb-1">
                    {filterType === "구역" ? item.eventType : item.location}
                  </Text>
                  <Text className="text-[13px] text-gray-400">
                    {item.description}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-[13px] text-gray-400 mr-1">
                    {item.timestamp}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#D1D1D6" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
