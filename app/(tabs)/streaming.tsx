import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import database from "@react-native-firebase/database";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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

  const startWebRTC = async () => {
    const pc = pcRef.current as any;
    if (!pc) return;

    // 원격 영상 수신 시
    pc.ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setIsConnected(true);
        setIsLoading(false);
      }
    };

    // ICE candidate 처리
    pc.onicecandidate = (event: any) => {
      // STUN 서버 처리 (자동)
    };

    // 영상 수신 트랜시버 추가
    pc.addTransceiver("video", { direction: "recvonly" });

    // offer 생성
    const offer = await pc.createOffer({});
    await pc.setLocalDescription(offer);

    // Firebase에 offer 업로드
    await database().ref("signaling/smart_cctv/offer").set({
      sdp: offer.sdp,
      type: offer.type,
    });

    // 라즈베리파이 answer 대기
    database()
      .ref("signaling/smart_cctv/answer")
      .on("value", async (snapshot) => {
        const answer = snapshot.val();
        if (answer && answer.sdp && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });
  };

  useEffect(() => {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
    startWebRTC();
    return () => {
      pcRef.current?.close();
    };
  }, []);

  return (
    <ScreenContainer>
      {/* 헤더 영역 */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold">실시간 스트리밍</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-6 mt-4">
        {/* 비디오 플레이어 영역 */}
        <View className="rounded-[32px] overflow-hidden shadow-lg bg-black relative h-64">
          {remoteStream ? (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={{ width: "100%", height: "100%" }}
              objectFit="cover"
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#5D60F1" />
              <Text className="text-white mt-2 text-xs">연결 중...</Text>
            </View>
          )}

          {/* LIVE 배지 */}
          {isConnected && (
            <View className="absolute top-5 left-5 bg-red-600 px-3 py-1 rounded-full flex-row items-center">
              <View className="w-2 h-2 bg-white rounded-full mr-2" />
              <Text className="text-white text-[12px] font-bold">LIVE</Text>
            </View>
          )}
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

          {/* 추가 컨트롤 버튼들 */}
          <View className="flex-row justify-around py-4">
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mb-2">
                <Ionicons name="camera" size={24} color="#555" />
              </View>
              <Text className="text-xs text-gray-600">스냅샷</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mb-2">
                <Ionicons name="mic" size={24} color="#555" />
              </View>
              <Text className="text-xs text-gray-600">말하기</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mb-2">
                <Ionicons name="volume-medium" size={24} color="#555" />
              </View>
              <Text className="text-xs text-gray-600">소리</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
