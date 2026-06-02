(() => {
  const root = (typeof globalThis !== "undefined" ? globalThis : global) as any;

  if (typeof root.Event !== "undefined" && typeof root.Proxy !== "undefined") {
    try {
      const OriginalEvent = root.Event;
      root.Event = new Proxy(OriginalEvent, {
        set: (target: any, prop: string, value: any) => {
          try {
            target[prop] = value;
          } catch (e) {}
          return true;
        },
        defineProperty: (target: any, prop: string, descriptor: any) => {
          try {
            Object.defineProperty(target, prop, descriptor);
          } catch (e) {}
          return true;
        },
      });
      if (OriginalEvent.prototype) {
        OriginalEvent.prototype = new Proxy(OriginalEvent.prototype, {
          set: (target: any, prop: string, value: any) => {
            try {
              target[prop] = value;
            } catch (e) {}
            return true;
          },
          defineProperty: (target: any, prop: string, descriptor: any) => {
            try {
              Object.defineProperty(target, prop, descriptor);
            } catch (e) {}
            return true;
          },
        });
      }
    } catch (proxyErr) {
      if (root.Event) root.Event.NONE = 0;
    }
  }

  const defineSafeGlobal = (name: string, value: any) => {
    if (typeof root[name] === "undefined") {
      root[name] = value;
    }
  };

  if (typeof root.DOMException === "undefined") {
    const DOMExceptionPolyfill = function (
      this: any,
      message?: string,
      name?: string,
    ) {
      this.message = message || "";
      this.name = name || "DOMException";
    } as any;
    DOMExceptionPolyfill.prototype = Object.create(Error.prototype);
    defineSafeGlobal("DOMException", DOMExceptionPolyfill);
  }
  defineSafeGlobal("Performance", function () {});
  defineSafeGlobal("PerformanceEntry", function () {});
  defineSafeGlobal("PerformanceObject", function () {});
  if (typeof root.performance === "undefined") {
    root.performance = {
      now: () => Date.now(),
      getEntries: () => [],
      memory: { jsHeapSizeLimit: 0, totalJSHeapSize: 0, usedJSHeapSize: 0 },
      NONE: 0,
    };
  }
  defineSafeGlobal("MessageQueue", function () {});
  defineSafeGlobal("MemoryInfo", function () {});
  defineSafeGlobal("PerformanceNavigation", function () {});
  defineSafeGlobal("PerformanceTiming", function () {});
  defineSafeGlobal("ReactNativeStartupTiming", {
    startTime: Date.now(),
    endInitTime: Date.now(),
  });
  defineSafeGlobal("FuseboxSessionObserver", function () {});
  defineSafeGlobal("LogBoxLog", function (this: any) {
    this.update = () => {};
    this.incrementRetryCount = () => {};
  });
  defineSafeGlobal("RCTDeviceEventEmitterImpl", function () {});
})();

import { useColorScheme } from "@/hooks/use-color-scheme";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import "react-native-reanimated";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  // 스플래시 제어용 로딩 상태 관리
  const [isReady, setIsReady] = useState(false);

  // 로그인 상태 확인
  const isLoggedIn = false; // 실제 로그인 상태로 대체

  // FCM 토큰 등록
useEffect(() => {
  async function registerFCMToken() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        console.log("FCM Token:", token);
        await firestore().collection("fcm_tokens").doc("device").set({
          token: token,
          updated_at: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn("FCM 토큰 등록 실패:", e);
    }
  }
  registerFCMToken();
}, []);

// FCM 알림 수신 핸들러
useEffect(() => {
  // 앱이 포그라운드일 때 알림 수신
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    const eventId = remoteMessage.data?.event_id || "";
    Alert.alert(
      remoteMessage.notification?.title || "보안 알림",
      remoteMessage.notification?.body || "",
      [
        { text: "닫기", style: "cancel" },
        {
          text: "확인하기",
          onPress: () => {
            router.push({
              pathname: "/(tabs)/event-clip/[id]",
              params: {
                korean_text: remoteMessage.notification?.body || "",
                id: "alert",
                event_id: eventId,
              },
            } as any);
          },
        },
      ]
    );
  });

  // 앱이 백그라운드에서 알림 탭했을 때
  messaging().onNotificationOpenedApp((remoteMessage) => {
    const eventId = remoteMessage.data?.event_id || "";
    router.push({
      pathname: "/(tabs)/event-clip/[id]",
      params: {
        korean_text: remoteMessage.notification?.body || "",
        id: "alert",
        event_id: eventId,
      },
    } as any);
  });

  // 앱이 완전히 꺼진 상태에서 알림 탭했을 때
  messaging()
  .getInitialNotification()
  .then((remoteMessage) => {
    if (remoteMessage && remoteMessage.sentTime && 
        Date.now() - remoteMessage.sentTime < 5000) {  // 5초 이내 알림만 처리
      const eventId = remoteMessage.data?.event_id || "";
      router.push({
        pathname: "/(tabs)/event-clip/[id]",
        params: {
          korean_text: remoteMessage.notification?.body || "",
          id: "alert",
          event_id: eventId,
        },
      } as any);
    }
  });

  return () => {
    unsubscribeForeground();
  };
}, []);

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
      router.replace("/");
    } else if (isLoggedIn && isAuthScreen) {
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