import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
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

interface AutoConditionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (minPeople: number, enterThresholdSec: number) => void;
}

export default function AutoConditionModal({
  isVisible,
  onClose,
  onSave,
}: AutoConditionModalProps) {
  const [minPeople, setMinPeople] = useState("1");
  const [enterThreshold, setEnterThreshold] = useState("2");

  useEffect(() => {
    if (isVisible) {
      setMinPeople("1");
      setEnterThreshold("2");
    }
  }, [isVisible]);

  const handleSave = () => {
    const people = Number(minPeople);
    const threshold = Number(enterThreshold);

    if (!people || people < 1) {
      alert("최소 인원은 1명 이상이어야 합니다.");
      return;
    }

    if (!threshold || threshold <= 0) {
      alert("체류 시간은 0보다 커야 합니다.");
      return;
    }

    onSave(people, threshold);
  };

  const handleClose = () => {
    onClose();
    setMinPeople("1");
    setEnterThreshold("2");
  };

  return (
    <Modal animationType="slide" transparent visible={isVisible}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="bg-white rounded-t-[40px] px-6 pt-2 pb-10">
              <View className="items-center mb-4">
                <View className="w-10 h-1 bg-gray-300 rounded-full" />
              </View>

              <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity
                  onPress={handleClose}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Ionicons name="close" size={20} color="black" />
                </TouchableOpacity>

                <Text className="text-lg font-bold">자동 조건 설정</Text>

                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-[#5D60F1] p-2 rounded-full"
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View className="bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 space-y-4">
                <View>
                  <Text className="text-sm text-gray-500 mb-2">
                    최소 인원
                  </Text>
                  <TextInput
                    value={minPeople}
                    onChangeText={setMinPeople}
                    placeholder="예: 1"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    className="text-lg font-medium text-gray-800 bg-white rounded-2xl px-4 py-3 border border-gray-200"
                  />
                </View>

                <View>
                  <Text className="text-sm text-gray-500 mb-2">
                    체류 시간 (초)
                  </Text>
                  <TextInput
                    value={enterThreshold}
                    onChangeText={setEnterThreshold}
                    placeholder="예: 2"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    className="text-lg font-medium text-gray-800 bg-white rounded-2xl px-4 py-3 border border-gray-200"
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
