import ScreenContainer from "@/components/screen-container";
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

  const { id, fromSubList, title, filterType, serverRecords } =
    useLocalSearchParams<{
      id: string;
      fromSubList?: string;
      title?: string;
      filterType?: string;
      serverRecords?: string;
    }>();

  const handleBack = () => {
    if (fromSubList === "true" && title && filterType) {
      router.push({
        pathname: "/record-sub-list",
        params: { title, filterType, serverRecords },
      });
    } else {
      router.push("/record");
    }
  };

  const records = serverRecords ? JSON.parse(serverRecords) : [];
  const record = records.find((item: any) => item.id === id);

  const formatTime = (createdAtObj: any) => {
    if (!createdAtObj) return "알 수 없음";
    // 파이어스토어 Timestamp 객체인 경우 처리
    if (createdAtObj.seconds) {
      const date = new Date(createdAtObj.seconds * 1000);
      return date.toLocaleString("ko-KR");
    }
    return String(createdAtObj);
  };

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
      <Text
        className="text-gray-400 text-[16px] font-medium text-right flex-1 ml-4"
        numberOfLines={2}
      >
        {value}
      </Text>
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
          <View className="mt-4 rounded-[32px] overflow-hidden shadow-sm relative bg-gray-900">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000", // CCTV 느낌의 플레이스홀더
              }}
              className="w-full h-64 opacity-80"
              resizeMode="cover"
            />
            {/* 빨간색 감지 박스 오버레이 효과 */}
            <View className="absolute top-6 right-6 border-2 border-[#FF5A5A] rounded-xl p-3 bg-red-500/10">
              <Text className="text-white text-[12px] font-bold">
                {record?.location || "Zone_A1"} 감지구역
              </Text>
            </View>
          </View>

          <Text className="text-gray-400 font-medium mt-8 mb-2 ml-1">
            AI 분석 요약
          </Text>
          <View className="bg-white rounded-[24px] px-5 py-2 shadow-sm border border-gray-50">
            <Text className="text-gray-800 text-[16px] leading-6 font-semibold py-2">
              {record?.description || "감지된 AI 요약 내용이 없습니다."}
            </Text>
            {record?.english_text && (
              <Text className="text-gray-400 text-[13px] italic pb-2">
                "{record.english_text}"
              </Text>
            )}
          </View>

          {/* 위치 및 시간 정보 */}
          <Text className="text-gray-400 font-medium mt-6 mb-2 ml-1">
            기본 정보
          </Text>
          <View className="bg-white rounded-[24px] px-5 shadow-sm border border-gray-50">
            <InfoRow
              label="감지 위치"
              value={record?.location || "알 수 없음"}
            />
            <InfoRow
              label="감지 시간"
              value={formatTime(record?.created_at)}
              isLast={true}
            />
          </View>

          {/* 라즈베리파이 수집 정밀 조건 */}
          <Text className="text-gray-400 font-medium mt-6 mb-2 ml-1">
            정밀 탐지 데이터
          </Text>
          <View className="bg-white rounded-[24px] px-5 shadow-sm border border-gray-50">
            <InfoRow
              label="대상과의 거리 (인물)"
              value={
                record?.person_depth
                  ? `${Number(record.person_depth).toFixed(2)}m`
                  : "측정 불가"
              }
            />
            <InfoRow
              label="타겟 식별 번호 (Track ID)"
              value={record?.track_id ? `ID #${record.track_id}` : "발급 안 됨"}
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
                params: { id: id },
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
