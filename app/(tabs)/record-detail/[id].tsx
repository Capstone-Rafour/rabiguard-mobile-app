import ScreenContainer from "@/components/screen-container";
import { MOCK_DATA } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecordDetailScreen() {
  const router = useRouter();
  const { id, fromSubList, title, filterType } = useLocalSearchParams<{
    id: string;
    fromSubList?: string;
    title?: string;
    filterType?: string;
  }>();

  const handleBack = () => {
    if (fromSubList === "true" && title && filterType) {
      router.push({
        pathname: "/record-sub-list",
        params: { title, filterType },
      });
    } else {
      router.push("/record");
    }
  };

  const record = MOCK_DATA.find((item) => item.id === id) || MOCK_DATA[0];

  const InfoRow = ({
    label,
    value,
    isLast = false,
  }: {
    label: string;
    value: string;
    isLast?: boolean;
  }) => (
    <View
      className={`flex-row justify-between items-center py-4 ${!isLast ? "border-b border-gray-50" : ""}`}
    >
      <Text className="text-gray-800 text-[16px]">{label}</Text>
      <Text className="text-gray-400 text-[16px] font-medium">{value}</Text>
    </View>
  );

  return (
    <ScreenContainer>
      <View className="px-6 pt-4">
        {/* 헤더 영역*/}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">기록 상세</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-6">
          {/* 이미지 영역 */}
          <View className="mt-4 rounded-[32px] overflow-hidden shadow-sm relative">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000",
              }}
              className="w-full h-64"
              resizeMode="cover"
            />
            <View className="absolute top-6 right-6 border-2 border-[#FF5A5A] rounded-xl p-3">
              <View className="bg-[#FF5A5A] absolute -top-3 left-2 px-2 py-0.5 rounded-md">
                <Text className="text-white text-[10px] font-bold">
                  {record.location}
                </Text>
              </View>
            </View>
          </View>

          {/* 시간 정보 */}
          <View className="bg-white rounded-[24px] px-5 mt-6 shadow-sm border border-gray-50">
            <InfoRow label="시간" value={record.timestamp} isLast={true} />
          </View>

          {/* 빠른 조건 */}
          <Text className="text-gray-400 font-medium mt-8 mb-2 ml-1">
            빠른 조건
          </Text>
          <View className="bg-white rounded-[24px] px-5 shadow-sm border border-gray-50">
            <InfoRow
              label="체류 시간"
              value={record.stayTime || "알 수 없음"}
            />
            <InfoRow
              label="명 수"
              value={record.peopleCount || "알 수 없음"}
              isLast={true}
            />
          </View>

          {/* 특별 조건 */}
          <Text className="text-gray-400 font-medium mt-8 mb-2 ml-1">
            특별 조건
          </Text>
          <View className="bg-white rounded-[24px] px-5 shadow-sm border border-gray-50">
            <InfoRow label="인상착의" value={record.outfit || "알 수 없음"} />
            <InfoRow
              label="나이대"
              value={record.ageGroup || "알 수 없음"}
              isLast={true}
            />
          </View>

          {/* 이벤트 클립 버튼 */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#5D60F1] flex-row justify-center items-center py-4 rounded-full mt-10 mb-6"
            style={{
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                },
                android: { elevation: 4 },
              }),
            }}
            onPress={() =>
              router.push({
                pathname: "/event-clip/[id]" as any,
                params: { id: record.id },
              })
            }
          >
            <Ionicons name="videocam" size={20} color="white" />
            <Text className="text-white font-bold text-[16px] ml-2">
              이벤트 클립 보기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
