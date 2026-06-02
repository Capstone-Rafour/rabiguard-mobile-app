import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface AddAreaModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function AddAreaModal({
  isVisible,
  onClose,
  onSave,
}: AddAreaModalProps) {
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (isVisible) {
      setTempName("");
    }
  }, [isVisible]);

  // 저장 버스 핸들러
  const handleSave = () => {
    const trimmedName = tempName.trim();
    if (!trimmedName) {
      alert("구역 이름을 입력해 주세요!");
      return;
    }
    onSave(trimmedName);
    setTempName("");
  };

  // 닫기 헬퍼 핸들러
  const handleClose = () => {
    onClose();
    setTempName("");
  };

  return (
    <Modal animationType="slide" transparent visible={isVisible}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="bg-white rounded-t-[40px] px-6 pt-2 pb-10">
              {/* 핸들바 */}
              <View className="items-center mb-4">
                <View className="w-10 h-1 bg-gray-300 rounded-full" />
              </View>

              {/* 헤더 */}
              <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity
                  onPress={handleClose}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Ionicons name="close" size={20} color="black" />
                </TouchableOpacity>

                {/* 이름이 비어있을 때는 기본 타이틀 가이드 제공 */}
                <Text className="text-lg font-bold">
                  {tempName.trim() ? tempName : "새 구역 추가"}
                </Text>

                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-[#5D60F1] p-2 rounded-full"
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* 이미지 가이드 영역 */}
              <View className="relative rounded-3xl overflow-hidden mb-6 bg-gray-200">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop",
                  }}
                  className="w-full h-56"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="border-2 border-dashed border-[#5D60F1] bg-[#5D60F1]/10 w-44 h-32 rounded-2xl" />
                </View>
              </View>

              {/* 입력창 */}
              <View className="bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4">
                <TextInput
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="예: 내 침대, 거실 소파, 식탁"
                  placeholderTextColor="#9CA3AF"
                  className="text-lg font-medium text-gray-800"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
