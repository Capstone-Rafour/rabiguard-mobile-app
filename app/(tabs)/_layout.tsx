import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "../../components/haptic-tab";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5D60F1",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          width: "92%",
          marginLeft: "4%",
          height: 68,
          borderRadius: 34,
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.5)",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.08,
          shadowRadius: 15,
          elevation: 5,
          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 2,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: "기록",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="record-detail/[id]"
        options={{
          title: "기록 상세",
          href: null,
        }}
      />
      <Tabs.Screen
        name="event-clip/[id]"
        options={{
          title: "이벤트 클립",
          href: null,
        }}
      />
      <Tabs.Screen
        name="my-page"
        options={{
          title: "마이페이지",
          href: null,
        }}
      />
      <Tabs.Screen
        name="area-setting"
        options={{
          title: "구역 설정",
          href: null,
        }}
      />
      <Tabs.Screen
        name="device-management"
        options={{
          title: "기기 관리",
          href: null,
        }}
      />
      <Tabs.Screen
        name="streaming"
        options={{
          title: "스트리밍",
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          title: "프로필 편집",
          href: null,
        }}
      />
      <Tabs.Screen
        name="notification-setting"
        options={{
          title: "알림 설정",
          href: null,
        }}
      />
    </Tabs>
  );
}
