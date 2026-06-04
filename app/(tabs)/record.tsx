import FilterModal from "@/components/filter-modal";
import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RecordItem } from "../../constants/data";
import { db } from "../../lib/firebase";

// 필터 타입 정의
type FilterType = "시간순" | "이벤트" | "구역"; // "이벤트"는 현재 필터선택 UI에서 제외됨

// 그룹 데이터 타입 정의
interface GroupedData {
  title: string;
  items: RecordItem[];
}

export default function RecordScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("시간순");
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // 실시간 데이터 상태 관리
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchRecords = async () => {
        try {
          setLoading(true);

          // auto_zones 데이터 전체 로드 (캐싱)
          const autoZonesSnapshot = await db.collection("auto_zones").get();
          const autoZonesMap = new Map();
          
          autoZonesSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            // zone_id나 문서 ID로 매칭하기 위해 여러 키로 저장
            autoZonesMap.set(doc.id, data.class_name); // 문서 ID로 매칭
            if (data.zone_id) {
              autoZonesMap.set(data.zone_id, data.class_name); // zone_id 필드로도 매칭
            }
          });
          
          console.log("📦 Auto zones 로드됨:", autoZonesMap.size);

          const snapshot = await db
            .collectionGroup("events")
            .orderBy("created_at", "desc")
            .get();

          console.log("✅ Events 총 개수:", snapshot.docs.length);

          // zone_id를 바탕으로 auto_zones에서 class_name 조회
          const fetchedData: RecordItem[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            const zoneId = data.zone_id || "알 수 없는 구역";

            // 메모리에서 class_name 찾기
            let zoneName = autoZonesMap.get(zoneId) || zoneId;
            
            if (zoneName !== zoneId) {
              console.log("✅ class_name 찾음:", zoneId, "=>", zoneName);
            }

            return {
              id: doc.id,
              location: zoneName,
              description: data.korean_text || "감지된 내용이 없습니다.",
              eventType: "사람 감지",
              className: data.class_name || "알 수 없는 객체",

              // 디테일 화면용 원본 필드 데이터 토스
              created_at: data.created_at,
              person_depth: data.person_depth,
              image_path: data.image_path,
              english_text: data.english_text,
              event_id: data.event_id || doc.id,
            } as any;
          });

          console.log("📊 최종 records:", fetchedData.slice(0, 3));
          setRecords(fetchedData);
          setLoading(false);
        } catch (e) {
          console.error("보안 로그를 불러오는데 실패했습니다:", e);
          setLoading(false);
        }
      };

      fetchRecords();
    }, []),
  );

  // 데이터 그룹화 로직
  const getGroupedData = (): GroupedData[] => {
    if (filter === "시간순") return [{ title: "최근 기록", items: records }];

    const key = filter === "구역" ? "location" : "eventType";

    const groups = records.reduce(
      (acc: { [key: string]: RecordItem[] }, item) => {
        const groupName =
          (item[key as keyof typeof item] as string) || "알 수 없음";
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(item);
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

  // 폴더 클릭 시 서브 리스트 화면으로 이동하는 함수
  const handleGroupPress = (title: string) => {
    router.push({
      pathname: "/record-sub-list",
      params: {
        title,
        filterType: filter,
        serverRecords: JSON.stringify(records),
      },
    });
  };

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

        {/* 로딩 스피너 */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#5D60F1" />
            <Text className="text-gray-400 mt-2">
              CCTV 기록을 불러오는 중...
            </Text>
          </View>
        ) : records.length === 0 ? (
          // 데이터가 텅 비었을 때 예외 처리
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400">최근 탐지된 기록이 없습니다.</Text>
          </View>
        ) : (
          /* 그룹별 기록 리스트 영역 */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {groupedData.map((group, index) => (
              <View key={index} className="mb-6">
                {filter === "시간순" ? (
                  <View>
                    <Text className="text-gray-400 font-medium mb-2 ml-1">
                      {group.title}
                    </Text>
                    <View className="bg-white rounded-[32px] px-4 shadow-sm border border-gray-50">
                      {group.items.map((item, idx) => (
                        <TouchableOpacity
                          key={item.id}
                          className={`flex-row items-center justify-between py-5 ${
                            idx !== group.items.length - 1
                              ? "border-b border-gray-50"
                              : ""
                          }`}
                          onPress={() =>
                            router.push({
                              pathname: "/(tabs)/event-clip/[id]",
                              params: {
                                id: item.id,
                                event_id: (item as any).event_id || "",
                                korean_text: item.description || "",
                              },
                            } as any)
                          }
                        >
                          <View className="flex-1">
                            <Text className="text-[17px] font-bold text-gray-800 mb-1">
                              {item.location}
                            </Text>
                            <Text
                              className="text-[13px] text-gray-400 pr-4"
                              numberOfLines={1}
                            >
                              {item.description}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#D1D1D6"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row justify-between items-center bg-white border border-gray-100 px-5 py-5 rounded-[24px] shadow-sm"
                    onPress={() => handleGroupPress(group.title)}
                  >
                    <View className="flex-row items-center">
                      <View>
                        <Text className="text-[18px] font-bold text-gray-800">
                          {group.title}
                        </Text>
                        <Text className="text-[12px] text-gray-400 mt-2">
                          총 {group.items.length}개의 기록
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}
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
