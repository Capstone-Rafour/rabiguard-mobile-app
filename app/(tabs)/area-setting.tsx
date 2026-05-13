import AddAreaModal from "@/components/add-area-modal";
import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
      {/* 상단 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">구역 설정</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* 카메라 뷰 */}
        <View className="relative mt-4 rounded-3xl overflow-hidden shadow-md">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop",
            }}
            className="w-full h-64 bg-gray-200"
          />

          {/* 자동 모드일 때 : 서버에서 인식한 기본 박스들 */}
          {mode === "auto" && (
            <>
              <View className="absolute top-20 left-10 border-2 border-red-500 rounded-lg p-1">
                <View className="bg-red-500 self-start px-1 rounded-sm">
                  <Text className="text-white text-[10px]">화분</Text>
                </View>
                <View className="w-20 h-32" />
              </View>
              <View className="absolute top-24 right-10 border-2 border-red-500 rounded-lg p-1">
                <View className="bg-red-500 self-start px-1 rounded-sm">
                  <Text className="text-white text-[10px]">소파</Text>
                </View>
                <View className="w-32 h-24" />
              </View>
            </>
          )}
          {/* 수동 모드일 때 : 저장된 박스들 표시 */}
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
          // 자동 감지 리스트 -> 추후에 서버에서 받아온 데이터로 매핑
          <View className="mt-6">
            <View className="bg-white rounded-3xl p-2 border border-gray-100">
              <ObjectRow name="소파" status="On" />
              <ObjectRow name="화분" status="On" />
              <ObjectRow name="테이블" status="Off" />
            </View>
            <Text className="text-gray-400 text-xs mt-4 px-2 leading-5">
              카메라가 자동으로 인식한 객체입니다.{"\n"}인식할 객체를 켜주세요.
            </Text>
          </View>
        ) : (
          //  수동 설정 리스트
          <View className="mt-6">
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="bg-[#5D60F1] py-4 rounded-2xl items-center mb-4"
            >
              <Text className="text-white font-bold text-lg">+ 구역 추가</Text>
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

      <AddAreaModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddArea}
      />
    </ScreenContainer>
  );
}

function ObjectRow({ name, status }: { name: string; status: string }) {
  return (
    <View className="flex-row items-center justify-between p-5 border-b border-gray-50 last:border-0">
      <Text className="text-[17px] font-medium text-gray-800">{name}</Text>
      <View className="flex-row items-center">
        <Text className="text-blue-500 mr-2">{status}</Text>
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </View>
    </View>
  );
}
