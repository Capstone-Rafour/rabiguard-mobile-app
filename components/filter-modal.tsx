import React from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 추가

type FilterType = "시간순" | "이벤트" | "구역";

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

export default function FilterModal({
  isVisible,
  onClose,
  currentFilter,
  onSelectFilter,
}: FilterModalProps) {
  const filters: FilterType[] = ["시간순", "이벤트", "구역"];
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 배경 클릭 시 닫기 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/5 justify-end">
          <View
            className="bg-white rounded-[24px] w-56 p-2 shadow-xl absolute"
            style={{
              top: insets.top + 95,
              right: insets.right + 24,
              backgroundColor: "rgba(255, 255, 255, 0.90)",
              elevation: 5,
            }}
          >
            {filters.map((item, index) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  onSelectFilter(item);
                  onClose();
                }}
                className={`py-3.5 items-center ${
                  index !== filters.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <Text
                  className={`text-base ${
                    currentFilter === item
                      ? "text-[#5D60F1] font-bold"
                      : "text-gray-700"
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
