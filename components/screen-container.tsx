import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
}

export default function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#F1F3F9]">{children}</SafeAreaView>
  );
}
