import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import database from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";

export default function EventClipScreen() {
  const router = useRouter();
  const { korean_text, event_id } = useLocalSearchParams();

  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isReceivingImage, setIsReceivingImage] = useState(false);

  // 이미지 청크 수신용
  const chunksRef = useRef<Uint8Array[]>([]);
  const totalFilesRef = useRef<number>(0);
  const receivedFilesRef = useRef<number>(0);

  useEffect(() => {
    console.log("받은 event_id:", event_id);

    const init = async () => {
      if (event_id) {
        await requestImageDownload(event_id as string);
      }
    
      // data_status가 ready가 될 때까지 대기
      await new Promise<void>((resolve) => {
        const unsubscribe = database()
          .ref("signaling/smart_cctv/data_status")
          .on("value", (snapshot: any) => {
            if (snapshot.val() === "ready") {
              database().ref("signaling/smart_cctv/data_status").off();
              resolve();
            }
          });
      });
    
      startDataConnection();
    };
  
    init();

    return () => {
      database().ref("signaling/smart_cctv/data_answer").off();
      database().ref("signaling/smart_cctv/data_offer").remove();
      database().ref("signaling/smart_cctv/data_answer").remove();
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  const requestImageDownload = async (eventId: string) => {
    try {
      console.log("download_event 명령 전송 시도:", eventId);
      await firestore().collection("commands").add({
        type: "download_event",
        event_id: eventId,
        created_at: firestore.FieldValue.serverTimestamp(),
      });
      console.log("download_event 명령 전송 완료:", eventId);
    } catch (e) {
      console.warn("download_event 명령 전송 실패:", e);
    }
  };

  const startDataConnection = async () => {

    // 기존 signaling 데이터 초기화
    await database().ref("signaling/smart_cctv/data_offer").remove();
    await database().ref("signaling/smart_cctv/data_answer").remove();
    await database().ref("signaling/smart_cctv/data_status").remove();

    setIsReceivingImage(true);
  
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    }) as any;
    pcRef.current = pc;
  
    // Data Channel 생성 (서버 측에서 ondatachannel로 받음)
    const dc = pc.createDataChannel("file-transfer");
    dc.binaryType = "arraybuffer";
  
    dc.onmessage = (e: any) => {
      const data = e.data;
      console.log("메시지 수신:", typeof data, typeof data === "string" ? data.substring(0, 50) : `바이너리 ${data.byteLength}bytes`);
  
      if (typeof data === "string") {
        try {
          const msg = JSON.parse(data);
  
          if (msg.type === "transfer_start") {
            totalFilesRef.current = msg.total_files;
            receivedFilesRef.current = 0;
            chunksRef.current = [];
            console.log(`파일 전송 시작: 총 ${msg.total_files}개`);
  
          } else if (msg.type === "file_start") {
            chunksRef.current = [];
            console.log(`파일 수신 시작: ${msg.filename}`);
  
          } else if (msg.type === "file_end") {
            const totalLength = chunksRef.current.reduce(
              (acc, chunk) => acc + chunk.length, 0
            );
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunksRef.current) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            const base64 = btoa(String.fromCharCode(...combined));
            setImageData(`data:image/jpeg;base64,${base64}`);
            chunksRef.current = [];
            receivedFilesRef.current += 1;
            console.log(`파일 수신 완료: ${msg.filename}`);
  
          } else if (msg.type === "transfer_end") {
            setIsReceivingImage(false);
            console.log("모든 파일 전송 완료");
          }
  
        } catch {
          // JSON 파싱 실패는 무시
        }
      } else {
        chunksRef.current.push(new Uint8Array(data));
        console.log(`바이너리 청크 수신: ${data.byteLength}bytes, 누적: ${chunksRef.current.length}개`);
      }
    };
  
    // offer 생성
    const offer = await pc.createOffer({});
    await pc.setLocalDescription(offer);
  
    await database().ref("signaling/smart_cctv/data_offer").set({
      sdp: offer.sdp,
      type: offer.type,
    });
  
    database()
      .ref("signaling/smart_cctv/data_answer")
      .on("value", async (snapshot: any) => {
        const answer = snapshot.val();
        if (answer && answer.sdp && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("data_answer 수신 완료");
        }
      });
  };

  // 실시간 영상 보기 버튼 클릭 시 streaming.tsx로 이동
  const handleStartStreaming = async () => {
    try {
      await firestore().collection("commands").add({
        type: "start_stream",
        created_at: firestore.FieldValue.serverTimestamp(),
      });
      console.log("start_stream 명령 전송 완료");
      router.push("/(tabs)/streaming" as any);
    } catch (e) {
      console.warn("start_stream 명령 전송 실패:", e);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-4">
        {/* 헤더 영역 */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">이벤트 클립</Text>
          <View className="w-10" />
        </View>

        {/* 영상/이미지 영역 */}
        <View className="rounded-[32px] overflow-hidden shadow-lg bg-black relative h-64">
          {isStreaming && remoteStream ? (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={{ width: "100%", height: "100%" }}
              objectFit="cover"
            />
          ) : imageData ? (
            <Image
              source={{ uri: imageData }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#5D60F1" />
              <Text className="text-white mt-2 text-xs">
                {isReceivingImage ? "이미지 수신 중..." : "연결 중..."}
              </Text>
            </View>
          )}

          {/* LIVE 배지 */}
          {isStreaming && (
            <View className="absolute top-5 left-5 bg-red-600 px-3 py-1 rounded-full flex-row items-center">
              <View className="w-2 h-2 bg-white rounded-full mr-2" />
              <Text className="text-white text-[14px] font-bold">LIVE</Text>
            </View>
          )}
        </View>

        {/* 상황 묘사 텍스트 */}
        <View className="mt-4 bg-gray-100 p-4 rounded-2xl">
          <Text className="text-gray-500 text-xs mb-1">상황 요약</Text>
          <Text className="text-gray-800 font-semibold text-base">
            {korean_text || "상황 정보 없음"}
          </Text>
        </View>

        {/* 실시간 영상 보기 버튼 */}
        <TouchableOpacity
          className="mt-4 w-full h-14 bg-[#5D60F1] rounded-xl justify-center items-center"
          onPress={handleStartStreaming}
        >
          <Text className="text-white text-lg font-bold">실시간 영상 보기</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}