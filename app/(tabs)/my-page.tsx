import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function MyPageScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        setUserInfo(JSON.parse(data));
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          await AsyncStorage.removeItem("userData");
          setUserInfo(null);
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-10">
        {/* 상단 프로필 영역 (이미지 스타일 참고) */}
        <View className="flex-row items-center mb-10">
          <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center overflow-hidden">
            <Ionicons name="person" size={32} color="#9CA3AF" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {userInfo?.email ? userInfo.email.split("@")[0] : "사용자"}님
            </Text>
            <Text className="text-gray-500 text-sm">{userInfo?.email}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* 메인 메뉴 카드 */}
        <View className="bg-white rounded-3xl p-2 shadow-sm">
          {/* 장소 관리 (기기 관리) */}
          <MenuRow
            icon="home-outline"
            title="장소 및 기기 관리"
            onPress={() => router.push("/(tabs)/device-management")}
          />

          {/* 알림 설정 */}
          <MenuRow
            icon="notifications-outline"
            title="알림 설정"
            onPress={() => console.log("알림 설정")}
          />

          {/* 로그아웃 (구분선 후 배치) */}
          <View className="h-[1px] bg-gray-100 my-1 mx-4" />
          <MenuRow
            icon="log-out-outline"
            title="로그아웃"
            textColor="text-red-500"
            iconColor="#EF4444"
            onPress={handleLogout}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

// 반복되는 메뉴 줄을 위한 컴포넌트
function MenuRow({
  icon,
  title,
  onPress,
  textColor = "text-gray-800",
  iconColor = "black",
}: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-5 justify-between"
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text className={`ml-4 text-[17px] font-medium ${textColor}`}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
