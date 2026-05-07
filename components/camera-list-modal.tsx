import React from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

{
  /* 카메라 리스트 모달 컴포넌트 - 실제 카메라 데이터로 교체 필요 */
}
const MOCK_CAMERAS = [
  { id: "1", name: "거실 메인 카메라" },
  { id: "2", name: "현관 입구 카메라" },
  { id: "3", name: "안방 서브 카메라" },
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
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-6 h-1/2">
          <Text className="text-2xl font-bold mb-6">카메라 선택</Text>

          <FlatList
            data={MOCK_CAMERAS}
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
