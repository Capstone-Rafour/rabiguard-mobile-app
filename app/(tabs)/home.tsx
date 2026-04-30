import CameraListModal from "@/components/camera-list-modal";
import ConnectedHomeScreen from "@/components/connected-home";
import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      {isConnected ? (
        <ConnectedHomeScreen />
      ) : (
        <ScreenContainer>
          <View className="flex-1 px-6">
            {/* 상단 헤더 영역 */}
            <View className="flex-row justify-between items-center py-4 mb-8">
              <Text className="text-3xl font-bold">홈</Text>
              <TouchableOpacity
                className="w-10 h-10 bg-[#5D60F1] rounded-full justify-center items-center"
                onPress={() => console.log("마이페이지 이동")}
              >
                <Ionicons name="person" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* 콘텐츠 영역 */}
            <View className="flex-1 justify-center items-center mb-20">
              <TouchableOpacity
                className="bg-[#5D60F1] px-10 py-4 rounded-full shadow-lg"
                activeOpacity={0.8}
                onPress={() => setIsModalVisible(true)}
              >
                <Text className="text-white text-lg font-bold text-center">
                  카메라 연결하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScreenContainer>
      )}

      <CameraListModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectCamera={(name) => {
          setIsConnected(true);
          setIsModalVisible(false);
          console.log(`선택된 카메라: ${name}`);
        }}
      />
    </>
  );
}
