import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import database from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";

export default function StreamingScreen() {
  const router = useRouter();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 전체화면 토글 함수
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      // 가로 모드로 전환 후 전체화면 ON
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
      setIsFullscreen(true);
    } else {
      // 세로 모드로 복구 후 전체화면 OFF
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    };
  }, []);

  const startWebRTC = async () => {

    // stream_status가 ready가 될 때까지 대기
    await new Promise<void>((resolve) => {
      console.log("stream_status 감시 시작");
      database()
        .ref("signaling/smart_cctv/stream_status")
        .on("value", (snapshot: any) => {
          const val = snapshot.val();
          console.log("stream_status 값:", val);
          if (val === "ready") {
            database().ref("signaling/smart_cctv/stream_status").off();
            resolve();
          }
        });
    });

    // 기존 signaling 데이터 초기화
    await database().ref("signaling/smart_cctv/offer").remove();
    await database().ref("signaling/smart_cctv/answer").remove();
    
    console.log("startWebRTC 시작");
    const pc = pcRef.current as any;
    if (!pc) {
      console.log("pc가 null임");
      return;
    }
    console.log("pc 초기화 완료");

    pc.ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setIsConnected(true);
        setIsLoading(false);
      }
    };

    pc.onicecandidate = (event: any) => {};

    pc.addTransceiver("video", { direction: "recvonly" });

    const offer = await pc.createOffer({});
    await pc.setLocalDescription(offer);

    await database().ref("signaling/smart_cctv/offer").set({
      sdp: offer.sdp,
      type: offer.type,
    });

    database()
      .ref("signaling/smart_cctv/answer")
      .on("value", async (snapshot) => {
        const answer = snapshot.val();
        if (answer && answer.sdp && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });
  };

  const handleBack = async () => {
    try {
      await firestore().collection("commands").add({
        type: "stop_stream",
        created_at: firestore.FieldValue.serverTimestamp(),
      });
      console.log("stop_stream 명령 전송 완료");
    } catch (e) {
      console.warn("stop_stream 명령 전송 실패:", e);
    }
    router.back();
  };

  useEffect(() => {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
    startWebRTC();
    return () => {
      database().ref("signaling/smart_cctv/answer").off();
      database().ref("signaling/smart_cctv").remove();
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  const renderVideoPlayer = () => {
    return (
      <View className="flex-1 w-full h-full bg-black relative justify-center items-center">
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={{ width: "100%", height: "100%" }}
            objectFit={isFullscreen ? "contain" : "cover"}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#5D60F1" />
            <Text className="text-white mt-2 text-sm font-semibold">
              연결 중...
            </Text>
          </View>
        )}

        {/* LIVE 배지 */}
        <View className="absolute top-5 left-5 bg-red-600 px-3 py-1 rounded-full flex-row items-center z-10">
          <View className="w-2 h-2 bg-white rounded-full mr-2" />
          <Text className="text-white text-[14px] font-bold">LIVE</Text>
        </View>

        {/* 전체화면 토글 버튼 */}
        <TouchableOpacity
          className="absolute bottom-5 right-5 bg-black/50 w-10 h-10 rounded-full justify-center items-center z-10"
          activeOpacity={0.7}
          onPress={toggleFullscreen}
        >
          <AntDesign
            name={isFullscreen ? "compress" : "expand"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer>
      {/* 세로 모드 일반 UI */}
      <View className="flex-1 px-6 pt-4">
        {/* 헤더 영역 */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            실시간 스트리밍
          </Text>
          <View className="w-10" />
        </View>

        {/* 비디오 플레이어 영역 (일반 세로 모드 고정 크기 고정) */}
        <View className="rounded-[32px] overflow-hidden shadow-lg bg-black h-64">
          {renderVideoPlayer()}
        </View>

        {/* 하단 정보 영역 */}
        <View className="mt-6 space-y-4">
          <View className="flex-row justify-between items-center bg-gray-100 p-5 rounded-2xl">
            <View>
              <Text className="text-gray-500 text-xs">연결된 기기</Text>
              <Text className="text-lg font-bold">거실 메인 카메라</Text>
            </View>
            <View
              className={`${isConnected ? "bg-green-100" : "bg-gray-200"} px-3 py-1 rounded-lg`}
            >
              <Text
                className={`${isConnected ? "text-green-600" : "text-gray-500"} font-bold text-xs`}
              >
                {isConnected ? "연결됨" : "연결 중..."}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 전체화면 전용 네이티브 모달 */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="none"
        // 세로(portrait)와 가로(landscape)를 모두 지원하도록 마스크를 열어줍니다.
        supportedOrientations={["portrait", "landscape"]}
      >
        <View className="flex-1 bg-black w-screen h-screen">
          <StatusBar hidden={true} />
          {renderVideoPlayer()}
        </View>
      </Modal>
    </ScreenContainer>
  );
}