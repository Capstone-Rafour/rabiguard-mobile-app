import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
  const [tempName, setTempName] = useState("소파");

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
                  onPress={onClose}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Ionicons name="close" size={20} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-bold">{tempName}</Text>
                <TouchableOpacity
                  onPress={() => onSave(tempName)}
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* 이미지 가이드 영역 */}
              <View className="relative rounded-3xl overflow-hidden mb-6 bg-gray-200">
                <Image
                  source={{ uri: "https://via.placeholder.com/400x250" }}
                  className="w-full h-56"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="border-2 border-red-500 w-44 h-32 rounded-2xl" />
                </View>
              </View>

              {/* 입력창 */}
              <View className="bg-white border border-gray-100 rounded-3xl px-6 py-4">
                <TextInput
                  value={tempName}
                  onChangeText={setTempName}
                  className="text-lg font-medium"
                  autoFocus
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
