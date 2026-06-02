import AddAreaModal from "@/components/add-area-modal";
import ScreenContainer from "@/components/screen-container";
import { db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

// Firebase에서 불러온 데이터 타입
interface AutoZone {
  id: string;
  className: string;
  isActive: boolean;
  minPeople: number;
  enterThresholdSec: number;

  // 박스 좌표
  box: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface CustomArea {
  id: string;
  name: string;
  status: "On" | "Off";
}

export default function AreaSettingScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customAreas, setCustomAreas] = useState<CustomArea[]>([]);
  const [autoZones, setAutoZones] = useState<AutoZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    const zonesRef = collection(db, "auto_zones");

    const unsubscribe = onSnapshot(zonesRef, (snapshot) => {
      const zonesData: AutoZone[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const polygon = data.polygon || [];

        // 여기서는 파이어베이스 좌표를 그대로 절대값 크기(px)로 치환하는 기본 예시
        const xValues = polygon.map((p: any) => p.x);
        const yValues = polygon.map((p: any) => p.y);

        const minX = xValues.length ? Math.min(...xValues) : 0;
        const maxX = xValues.length ? Math.max(...xValues) : 100;
        const minY = yValues.length ? Math.min(...yValues) : 0;
        const maxY = yValues.length ? Math.max(...yValues) : 100;

        // 모바일 화면(h-64 = 256px) 내부 안으로 들어오도록 스케일 보정이 필요할 경우
        // 아래 box 계산식에서 비율을 곱해주시면 됩니다. (예: minX * 0.25)
        return {
          id: docSnap.id,
          className: data.class_name || "알 수 없는 객체",
          isActive: data.is_active ?? true,
          minPeople: data.min_people || 1,
          enterThresholdSec: data.enter_threshold_sec || 2,
          box: {
            left: minX,
            top: minY,
            width: maxX - minX || 80,
            height: maxY - minY || 80,
          },
        };
      });

      setAutoZones(zonesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 자동 감지 객체 활성화/비활성화 토글 함수
  const handleToggleAutoZone = async (id: string, currentStatus: boolean) => {
    try {
      const zoneDocRef = doc(db, "auto_zones", id);
      await updateDoc(zoneDocRef, {
        is_active: !currentStatus,
      });
    } catch (error) {
      console.error("구역 상태 업데이트 실패:", error);
    }
  };

  const handleAddArea = (name: string) => {
    const newArea: CustomArea = {
      id: Date.now().toString(),
      name: name,
      status: "On",
    };
    setCustomAreas([...customAreas, newArea]);
    setIsModalVisible(false);
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-4">
        {/* 헤더 영역*/}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">구역 설정</Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 카메라 뷰 */}
          <View className="relative mt-4 rounded-3xl overflow-hidden shadow-md bg-gray-200">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop",
              }}
              className="w-full h-64"
            />

            {isLoading ? (
              <View className="absolute inset-0 justify-center items-center bg-black/10">
                <ActivityIndicator size="large" color="#5D60F1" />
              </View>
            ) : (
              <>
                {/* 이미지 위에 절대 좌표로 박스를 오버레이할 컨테이너 */}
                <View className="absolute inset-0">
                  {mode === "auto" &&
                    autoZones.map((zone) => {
                      if (!zone.isActive) return null;

                      // 🛠️ 확인된 AI 서버 원본 영상 해상도 세팅
                      const SERVER_WIDTH = 640;
                      const SERVER_HEIGHT = 480;

                      // 🛠️ 우리 앱 이미지 뷰의 실제 크기 세팅
                      const APP_IMAGE_HEIGHT = 256; // h-64는 고정 256px
                      // 횡 패딩(px-6 = 24px * 2 = 48px)을 제외한 실제 이미지의 가로 너비 계산
                      const APP_IMAGE_WIDTH = screenWidth - 48;

                      // 640x480 화면을 모바일 화면 크기로 압축하는 마법의 비율
                      const scaleX = APP_IMAGE_WIDTH / SERVER_WIDTH;
                      const scaleY = APP_IMAGE_HEIGHT / SERVER_HEIGHT;

                      // 모바일 해상도에 맞게 픽셀 좌표 재계산
                      const scaledLeft = zone.box.left * scaleX;
                      const scaledTop = zone.box.top * scaleY;
                      const scaledWidth = zone.box.width * scaleX;
                      const scaledHeight = zone.box.height * scaleY;

                      return (
                        <View
                          key={zone.id}
                          className="absolute border-2 border-red-500 rounded-lg p-0.5"
                          style={{
                            left: scaledLeft,
                            top: scaledTop,
                            width: Math.max(scaledWidth, 50), // 탁구대 크기에 맞게 최소 너비 보장
                            height: Math.max(scaledHeight, 40), // 최소 높이 보장
                          }}
                        >
                          <View className="bg-red-500 self-start px-1 rounded-sm">
                            <Text className="text-white text-[10px] font-bold">
                              {zone.className}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                </View>

                {/* 수동 모드일 때 (기존 유지) */}
                {mode === "manual" &&
                  customAreas.map((area) => (
                    <View
                      key={area.id}
                      className="absolute top-20 right-10 border-2 border-red-500 rounded-lg"
                    >
                      <View className="bg-red-500 self-start px-2 py-0.5">
                        <Text className="text-white text-[12px] font-bold">
                          {area.name}
                        </Text>
                      </View>
                      <View className="w-40 h-28" />
                    </View>
                  ))}
              </>
            )}
          </View>

          {/* 자동/수동 탭 */}
          <View className="flex-row bg-gray-100 rounded-2xl p-1 mt-6">
            <TouchableOpacity
              onPress={() => setMode("auto")}
              className={`flex-1 py-3 rounded-xl ${mode === "auto" ? "bg-white" : ""}`}
              style={mode === "auto" ? { elevation: 2 } : {}}
            >
              <Text
                className={`text-center font-bold ${mode === "auto" ? "text-black" : "text-gray-400"}`}
              >
                자동 설정
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("manual")}
              className={`flex-1 py-3 rounded-xl ${mode === "manual" ? "bg-white" : ""}`}
              style={mode === "manual" ? { elevation: 2 } : {}}
            >
              <Text
                className={`text-center font-bold ${mode === "manual" ? "text-black" : "text-gray-400"}`}
              >
                수동 설정
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "auto" ? (
            // 자동 감지 리스트 -> 파이어베이스에서 실시간 렌더링 및 클릭 토글 연동
            <View className="mt-6">
              {autoZones.length > 0 ? (
                <View className="bg-white rounded-3xl p-2 border border-gray-100">
                  {autoZones.map((zone) => (
                    <ObjectRow
                      key={zone.id}
                      name={zone.className}
                      status={zone.isActive ? "On" : "Off"}
                      onToggle={() =>
                        handleToggleAutoZone(zone.id, zone.isActive)
                      }
                    />
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-3xl p-8 border border-gray-100 items-center">
                  <Text className="text-gray-400">
                    인식된 자동 구역이 없습니다.
                  </Text>
                </View>
              )}
              <Text className="text-gray-400 text-xs mt-4 px-2 leading-5">
                카메라가 자동으로 인식한 객체입니다.{"\n"}줄을 누르면 해당 객체
                인식을 켜고 끌 수 있습니다.
              </Text>
            </View>
          ) : (
            // 수동 설정 리스트
            <View className="mt-6">
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                className="bg-[#5D60F1] py-4 rounded-2xl items-center mb-4"
              >
                <Text className="text-white font-bold text-lg">
                  + 구역 추가
                </Text>
              </TouchableOpacity>

              {customAreas.length > 0 && (
                <View className="bg-white rounded-3xl p-2 border border-gray-100">
                  {customAreas.map((area) => (
                    <ObjectRow
                      key={area.id}
                      name={area.name}
                      status={area.status}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      <AddAreaModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddArea}
      />
    </ScreenContainer>
  );
}

function ObjectRow({
  name,
  status,
  onToggle,
}: {
  name: string;
  status: string;
  onToggle?: () => void;
}) {
  const isOn = status === "On";

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={!onToggle}
      className="flex-row items-center justify-between p-5 border-b border-gray-50 last:border-0"
    >
      <Text
        className={`text-[17px] font-medium ${isOn ? "text-gray-800" : "text-gray-400"}`}
      >
        {name}
      </Text>

      <View className="flex-row items-center">
        <Switch
          trackColor={{ false: "#E5E7EB", true: "#C7C9FB" }}
          thumbColor={isOn ? "#5D60F1" : "#9CA3AF"}
          ios_backgroundColor="#E5E7EB"
          value={isOn}
          onValueChange={onToggle}
        />
      </View>
    </TouchableOpacity>
  );
}
