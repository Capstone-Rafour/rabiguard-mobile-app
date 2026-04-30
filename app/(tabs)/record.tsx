import React from "react";
import { Text, View } from "react-native";
import ScreenContainer from "../../components/screen-container";

export default function RecordScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">기록 화면</Text>
      </View>
    </ScreenContainer>
  );
}
