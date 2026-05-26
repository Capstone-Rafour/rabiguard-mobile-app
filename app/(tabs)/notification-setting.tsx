import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Switch, Text, TouchableOpacity, View } from "react-native";

export default function NotificationSettingsScreen() {
  const router = useRouter();

  // 토글 스위치 상태 관리
  const [motionDetected, setMotionDetected] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState(true);

  // 기존 설정값 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(
          "notificationSettings",
        );
        if (storedSettings) {
          const { motion, device } = JSON.parse(storedSettings);
          setMotionDetected(motion);
          setDeviceStatus(device);
        }
      } catch (e) {
        console.error("설정 불러오기 실패", e);
      }
    };
    loadSettings();
  }, []);

  // 토글 변경 시 AsyncStorage에 즉시 저장하는 함수
  const saveSettings = async (motion: boolean, device: boolean) => {
    try {
      const settings = { motion, device };
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(settings),
      );
    } catch (e) {
      console.error("설정 저장 실패", e);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-4">
        {/* 헤더 영역 */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.push("/my-page")}
            className="w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">알림 설정</Text>
          <View className="w-10" />
        </View>

        <View className="bg-white rounded-3xl p-2 shadow-sm">
          {/* 1. 움직임 감지 알림 */}
          <SettingRow
            title="움직임 감지 알림"
            description="움직임이 감지되면 알림을 받습니다."
            value={motionDetected}
            onValueChange={(newValue) => {
              setMotionDetected(newValue);
              saveSettings(newValue, deviceStatus);
            }}
          />

          <View className="h-[1px] bg-gray-100 mx-4" />

          {/* 2. 기기 연결 상태 알림 */}
          <SettingRow
            title="기기 상태 알림"
            description="기기 연결이 끊어지면 알림을 받습니다."
            value={deviceStatus}
            onValueChange={(newValue) => {
              setDeviceStatus(newValue);
              saveSettings(motionDetected, newValue);
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

// 토글 줄을 위한 컴포넌트
function SettingRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 py-7">
      <View className="flex-1 mr-4">
        <Text className="text-[18px] font-semibold text-gray-800 mb-3">
          {title}
        </Text>
        <Text className="text-[14px] text-gray-400 leading-5">
          {description}
        </Text>
      </View>
      <Switch
        trackColor={{ false: "#E5E7EB", true: "#5D60F1" }}
        thumbColor={Platform.OS === "ios" ? "" : "#ffffff"}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
}
