import FilterModal from "@/components/filter-modal";
import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// 필터 타입 정의
type FilterType = "시간순" | "이벤트" | "구역";

// 아이템 타입 정의
interface RecordItem {
  id: string;
  location: string;
  description: string;
  timestamp: string;
  eventType?: string; // 옵셔널로 추가
}

// 그룹 데이터 타입 정의
interface GroupedData {
  title: string;
  items: RecordItem[];
}

// 임시 데이터 - 실제 데이터로 교체 필요
const MOCK_DATA = [
  {
    id: "1",
    location: "소파",
    description: "체류 시간 15분 / 1명",
    timestamp: "12:30",
    eventType: "특별 조건",
  },
  {
    id: "2",
    location: "식탁",
    description: "이벤트 감지",
    timestamp: "11:45",
    eventType: "빠른 조건",
  },
  {
    id: "3",
    location: "침대",
    description: "움직임 없음",
    timestamp: "10:20",
    eventType: "빠른 조건",
  },
  {
    id: "4",
    location: "현관",
    description: "출입 감지",
    timestamp: "09:15",
    eventType: "빠른 조건",
  },
  {
    id: "5",
    location: "부엌",
    description: "체류 시간 5분 / 2명",
    timestamp: "08:50",
    eventType: "특별 조건",
  },
  {
    id: "6",
    location: "소파",
    description: "체류 시간 30분 / 1명",
    timestamp: "07:30",
    eventType: "특별 조건",
  },
  {
    id: "7",
    location: "서재",
    description: "이벤트 감지",
    timestamp: "06:10",
    eventType: "빠른 조건",
  },
  {
    id: "8",
    location: "거실",
    description: "움직임 감지",
    timestamp: "05:00",
    eventType: "빠른 조건",
  },
  {
    id: "9",
    location: "화장실",
    description: "출입 감지",
    timestamp: "03:45",
    eventType: "빠른 조건",
  },
  {
    id: "10",
    location: "침대",
    description: "취침 시작",
    timestamp: "01:20",
    eventType: "특별 조건",
  },
];

export default function RecordScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("시간순");
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // 데이터 그룹화 로직
  const getGroupedData = (): GroupedData[] => {
    if (filter === "시간순")
      return [{ title: "최근 기록", items: MOCK_DATA as RecordItem[] }];

    const key = filter === "구역" ? "location" : "eventType";

    const groups = MOCK_DATA.reduce(
      (acc: { [key: string]: RecordItem[] }, item) => {
        const groupName =
          (item[key as keyof typeof item] as string) || "알 수 없음";
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(item as RecordItem);
        return acc;
      },
      {},
    );

    return Object.keys(groups).map((name) => ({
      title: name,
      items: groups[name],
    }));
  };

  const groupedData = getGroupedData();

  // const renderItem = ({ item }: { item: (typeof MOCK_DATA)[0] }) => (
  //   <TouchableOpacity className="flex-row items-center justify-between py-4 px-2 border-b border-gray-100">
  //     <View>
  //       <Text className="text-lg font-bold text-gray-800">{item.location}</Text>
  //       <Text className="text-sm text-gray-400">{item.description}</Text>
  //     </View>
  //     <View className="flex-row items-center">
  //       <Text className="text-sm text-gray-400 mr-2">{item.timestamp}</Text>
  //       <Ionicons name="chevron-forward" size={18} color="#D1D1D6" />
  //     </View>
  //   </TouchableOpacity>
  // );

  return (
    <ScreenContainer>
      <View className="flex-1 px-6">
        {/* 상단 헤더 영역 */}
        <View className="flex-row justify-between items-center py-4 mb-8">
          <Text className="text-3xl font-bold">기록</Text>
          <TouchableOpacity
            className="w-10 h-10 bg-[#5D60F1] rounded-full justify-center items-center"
            onPress={() => router.push("/my-page")}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 드롭다운 버튼 영역 */}
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            className="flex-row items-center px-3 py-2 rounded-lg"
            onPress={() => setIsMenuVisible(true)}
          >
            <Text className="text-[#5D60F1] font-semibold mr-1">{filter}</Text>
            <Ionicons name="swap-vertical" size={14} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* 그룹별 기록 리스트 영역 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {groupedData.map((group, index) => (
            <View key={index} className="mb-6">
              <Text className="text-gray-400 font-medium mb-2 ml-1">
                {group.title}
              </Text>
              <View className="bg-white rounded-[32px] px-4 shadow-sm border border-gray-50">
                {group.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    className={`flex-row items-center justify-between py-5 ${idx !== group.items.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <View className="flex-1">
                      <Text className="text-[17px] font-bold text-gray-800 mb-1">
                        {item.location}
                      </Text>
                      <Text className="text-[13px] text-gray-400">
                        {item.description}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-[13px] text-gray-400 mr-1">
                        이벤트 발생 시간&날짜
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#D1D1D6"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <FilterModal
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        currentFilter={filter}
        onSelectFilter={(selected) => setFilter(selected)}
      />
    </ScreenContainer>
  );
}
