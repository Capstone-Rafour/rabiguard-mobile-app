import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import database from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const [signalingError, setSignalingError] = useState<string | null>(null);
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
    const pc = pcRef.current as any;
    if (!pc) {
      console.log("pc가 null임");
      return;
    }

    let remoteDescriptionSet = false;
    let answerListener: any = null;

    const statusRef = database().ref("signaling/smart_cctv/stream_status");
    const statusSnapshot = await statusRef.once("value");
    if (statusSnapshot.val() !== "ready") {
      console.log("stream_status 감시 시작");
      await new Promise<void>((resolve) => {
        const statusCallback = (snapshot: any) => {
          const val = snapshot.val();
          console.log("stream_status 값:", val);
          if (val === "ready") {
            statusRef.off("value", statusCallback);
            resolve();
          }
        };
        statusRef.on("value", statusCallback);
      });
    } else {
      console.log("stream_status 이미 ready 상태");
    }

    await database().ref("signaling/smart_cctv/offer").remove();
    await database().ref("signaling/smart_cctv/answer").remove();

    console.log("startWebRTC 시작");
    console.log("pc 초기화 완료");

    pc.ontrack = (event: any) => {
      console.log("pc.ontrack", {
        streams: event.streams?.length,
        trackKind: event.track?.kind,
        trackId: event.track?.id,
      });

      let stream = event.streams?.[0];
      if (!stream && event.track) {
        stream = new MediaStream();
        stream.addTrack(event.track);
      }

      if (stream) {
        setRemoteStream(stream);
        setIsConnected(true);
        setIsLoading(false);
      }
    };

    pc.onaddstream = (event: any) => {
      console.log("pc.onaddstream", event.stream);
      if (event.stream) {
        setRemoteStream(event.stream);
        setIsConnected(true);
        setIsLoading(false);
      }
    };

    let iceGatheringComplete: (() => void) | null = null;
    const iceGatheringPromise = new Promise<void>((resolve) => {
      iceGatheringComplete = resolve;
    });

    pc.onicecandidate = (event: any) => {
      if (event?.candidate) {
        console.log("ICE candidate generated", event.candidate);
      } else {
        console.log("ICE gathering complete");
        iceGatheringComplete?.();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        "ICE state",
        pc.iceConnectionState,
        pc.connectionState,
        pc.signalingState,
      );
      if (pc.iceConnectionState === "failed") {
        setIsConnected(false);
        setIsLoading(false);
        setSignalingError("ICE 연결에 실패했습니다. 뒤로 나갔다가 다시 시도해 주세요.");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("connection state", pc.connectionState);
    };

    pc.onsignalingstatechange = () => {
      console.log("signaling state", pc.signalingState);
    };

    pc.addTransceiver("video", { direction: "recvonly" });

    const offer = await pc.createOffer({});
    await pc.setLocalDescription(offer);

    console.log("local description set, waiting for ICE gathering to complete");
    await iceGatheringPromise;
    console.log("sending offer after ICE gather complete");

    await database().ref("signaling/smart_cctv/offer").set({
      sdp: pc.localDescription?.sdp || offer.sdp,
      type: pc.localDescription?.type || offer.type,
    });

    answerListener = database()
      .ref("signaling/smart_cctv/answer")
      .on("value", async (snapshot) => {
        const answer = snapshot.val();
        console.log("answer snapshot", answer);

        if (answer && answer.sdp && !remoteDescriptionSet) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("remote description set");
            remoteDescriptionSet = true;
          } catch (error) {
            console.warn("failed to set remote description", error);
            setSignalingError("응답 SDP를 설정할 수 없습니다.");
          }
        }
      });

    setTimeout(() => {
      if (!remoteDescriptionSet) {
        console.warn("Answer 미수신: 연결 지연 중");
        setSignalingError("응답을 기다리는 중입니다. 다시 시도해 주세요.");
        setIsLoading(false);
      }
    }, 15000);
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

  useFocusEffect(
    useCallback(() => {
      pcRef.current = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      });
      startWebRTC();
      return () => {
        database().ref("signaling/smart_cctv/answer").off();
        database().ref("signaling/smart_cctv/stream_status").off();
        database().ref("signaling/smart_cctv").remove();
        pcRef.current?.close();
        pcRef.current = null;
        setRemoteStream(null);
        setIsConnected(false);
        setIsLoading(true);
      };
    }, [])
  );

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

          {signalingError ? (
            <View className="bg-red-100 border border-red-200 p-4 rounded-2xl">
              <Text className="text-red-700 font-semibold">{signalingError}</Text>
            </View>
          ) : null}
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