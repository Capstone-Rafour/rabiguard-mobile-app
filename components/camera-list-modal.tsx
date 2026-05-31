import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
{
  /* 카메라 리스트 모달 컴포넌트 - 실제 카메라 데이터로 교체 필요 */
}
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

interface CameraListModalProps {
  visible: boolean;
  onClose: () => void;
  cameras: any[];
  onSelectCamera: (name: string) => void;
}

export default function CameraListModal({
  visible,
  onClose,
  onSelectCamera,
  cameras,
}: CameraListModalProps) {
  const router = useRouter();

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-6 h-1/2">
          <Text className="text-2xl font-bold mb-6">카메라 선택</Text>

          <FlatList
            data={MOCK_DEVICES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="py-5 border-b border-gray-100"
                onPress={() => {
                  onSelectCamera(item.name);
                }}
              >
                <Text className="text-lg font-medium">{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            className="bg-[#5D60F1] h-14 rounded-2xl flex-row items-center justify-center mt-4"
            onPress={() => {
              onClose();
              router.push("/add-device");
            }}
          >
            <AntDesign name="plus" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              새 기기 등록하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 p-4 bg-gray-100 rounded-2xl items-center"
            onPress={onClose}
          >
            <Text className="font-bold text-gray-500">취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
