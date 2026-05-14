import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css";

SplashScreen.preventAutoHideAsync();

// export const unstable_settings = {
//   anchor: "(tabs)",
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  // 스플래시 제어용 로딩 상태 관리
  const [isReady, setIsReady] = useState(false);

  // 로그인 상태 확인
  const isLoggedIn = false; // 실제 로그인 상태로 대체

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  // 인증 로직(로그인 여부에 따른 라우팅)
  useEffect(() => {
    if (!isReady) return;

    const authScreens = [
      "index",
      "login",
      "sign-up",
      "verification",
      "find-password",
    ];
    const isAuthScreen = authScreens.includes(segments[0] as string);

    if (!isLoggedIn && !isAuthScreen) {
      // 로그인 안 됐는데 서비스 내부(tabs 등)로 들어가려 하면?
      // 가장 첫 화면인 index로 튕겨냅니다.
      router.replace("/");
    } else if (isLoggedIn && isAuthScreen) {
      // 로그인 됐는데 로그인 화면이나 index에 머물러 있다면?
      // 메인 홈으로 보냅니다.
      router.replace("/(tabs)/home" as any);
    }
  }, [isLoggedIn, segments, isReady]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
