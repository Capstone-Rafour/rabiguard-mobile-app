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

interface ZoneOption {
  id: string;
  name: string;
}

interface AutoConditionModalProps {
  isVisible: boolean;
  onClose: () => void;
  zones?: ZoneOption[];
  onSave: (zoneId: string | null, minPeople: number, enterThresholdSec: number) => void;
}

export default function AutoConditionModal({
  isVisible,
  onClose,
  zones = [],
  onSave,
}: AutoConditionModalProps) {
  const [minPeople, setMinPeople] = useState("1");
  const [enterThreshold, setEnterThreshold] = useState("2");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    zones.length ? zones[0].id : null,
  );
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMinPeople("1");
      setEnterThreshold("2");
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setSelectedZoneId(zones.length ? zones[0].id : null);
      setOpenDropdown(false);
    }
  }, [isVisible, zones]);

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

    onSave(selectedZoneId, people, threshold);
    setMinPeople("1");
    setEnterThreshold("2");
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

                <Text className="text-lg font-bold">상세 조건 설정</Text>

                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-[#5D60F1] p-2 rounded-full"
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {zones.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm text-gray-500 mb-2">구역 선택</Text>
                  <View className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                    <TouchableOpacity
                      onPress={() => setOpenDropdown((v) => !v)}
                      className="flex-row items-center justify-between"
                    >
                      <Text className="text-lg font-medium text-gray-800">
                        {zones.find((z) => z.id === selectedZoneId)?.name || "구역 선택"}
                      </Text>
                      <Ionicons
                        name={openDropdown ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {openDropdown && (
                    <View className="bg-white border border-gray-200 rounded-2xl mt-2 max-h-40">
                      {zones.map((z) => (
                        <TouchableOpacity
                          key={z.id}
                          onPress={() => {
                            setSelectedZoneId(z.id);
                            setOpenDropdown(false);
                          }}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text className="text-base">{z.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <View className="space-y-4">
                <View>
                  <Text className="text-sm text-gray-500 mb-2">최소 인원</Text>
                  <View className="bg-white rounded-2xl px-4 border border-gray-200">
                    <TextInput
                      value={minPeople}
                      onChangeText={setMinPeople}
                      placeholder="예: 1"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      className="text-lg font-medium text-gray-800"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm text-gray-500 mb-2">체류 시간 (초)</Text>
                  <View className="bg-white rounded-2xl px-4 border border-gray-200">
                    <TextInput
                      value={enterThreshold}
                      onChangeText={setEnterThreshold}
                      placeholder="예: 2"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      className="text-lg font-medium text-gray-800"
                    />
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
