import ScreenContainer from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import database from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";

const FileSystem = require("expo-file-system/legacy");

export default function EventClipScreen() {
  const router = useRouter();
  const { korean_text, event_id } = useLocalSearchParams();

  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [imageList, setImageList] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isReceivingImage, setIsReceivingImage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 핀치 줌용
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 이미지 청크 수신용
  const chunksRef = useRef<Uint8Array[]>([]);
  const totalFilesRef = useRef<number>(0);
  const receivedFilesRef = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      console.log("받은 event_id:", event_id);
  
      const init = async () => {
        if (!event_id) return;
      
        // 캐시 확인
        const cacheDir = `${FileSystem.cacheDirectory}events/${event_id}/`;
        const cacheDirInfo = await FileSystem.getInfoAsync(cacheDir);
      
        if (cacheDirInfo.exists) {
          // 캐시된 이미지 불러오기
          console.log("캐시된 이미지 로드:", event_id);
          const files = await FileSystem.readDirectoryAsync(cacheDir);
          const sortedFiles = files.sort();
          const cachedImages = sortedFiles.map((f: string) => `${cacheDir}${f}`);
          setImageList(cachedImages);
          setSelectedImage(cachedImages[0]);
          return;
        }
      
        // 캐시 없으면 다운로드
        await requestImageDownload(event_id as string);
      
        await new Promise<void>((resolve) => {
          database()
            .ref("signaling/smart_cctv/data_status")
            .on("value", (snapshot: any) => {
              if (snapshot.val() === "ready") {
                database().ref("signaling/smart_cctv/data_status").off();
                resolve();
              }
            });
        });
      
        startDataConnection(event_id as string);
      };
  
      init();
  
      return () => {
        database().ref("signaling/smart_cctv/data_answer").off();
        database().ref("signaling/smart_cctv/data_offer").remove();
        database().ref("signaling/smart_cctv/data_answer").remove();
        pcRef.current?.close();
        pcRef.current = null;
        setImageList([]);
        setSelectedImage(null);
        setIsReceivingImage(false);
      };
    }, [event_id])
  );

  useEffect(() => {
    if (imageList.length <= 1 || !autoSlide) return;
  
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % imageList.length;
        setSelectedImage(imageList[next]);
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 2000);
  
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [imageList.length, autoSlide]);

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

  const startDataConnection = async (eventId: string) => {
    await database().ref("signaling/smart_cctv/data_offer").remove();
    await database().ref("signaling/smart_cctv/data_answer").remove();
    await database().ref("signaling/smart_cctv/data_status").remove();
  
    setIsReceivingImage(true);
  
    const cacheDir = `${FileSystem.cacheDirectory}events/${eventId}/`;
    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
  
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    }) as any;
    pcRef.current = pc;
  
    const dc = pc.createDataChannel("file-transfer");
    dc.binaryType = "arraybuffer";
  
    let currentFilename = "";
  
    dc.onmessage = async (e: any) => {
      const data = e.data;
  
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
            currentFilename = msg.filename;
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
  
            // 파일 저장
            const filePath = `${cacheDir}${currentFilename}`;
            await FileSystem.writeAsStringAsync(filePath, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
  
            setImageList((prev) => {
              const updated = [...prev, filePath];
              if (updated.length === 1) setSelectedImage(filePath);
              return updated;
            });
            chunksRef.current = [];
            receivedFilesRef.current += 1;
            console.log(`파일 저장 완료: ${filePath}`);
  
          } else if (msg.type === "transfer_end") {
            setIsReceivingImage(false);
            console.log("모든 파일 전송 완료");
          }
  
        } catch {
          // JSON 파싱 실패 무시
        }
      } else {
        chunksRef.current.push(new Uint8Array(data));
      }
    };
  
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

  const onPinchEvent = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      scale.value = Math.max(1, Math.min(event.nativeEvent.scale, 5));
    }
    if (event.nativeEvent.state === State.END) {
      scale.value = withTiming(1, { duration: 300 });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenContainer>
        <View className="flex-1 px-6 pt-4">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 justify-center"
            >
              <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">이벤트 클립</Text>
            <View className="w-10" />
          </View>

          {/* 메인 이미지 영역 */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => selectedImage && setModalVisible(true)}
          >
            <View className="rounded-[32px] overflow-hidden shadow-lg bg-black relative h-64">
              {isStreaming && remoteStream ? (
                <RTCView
                  streamURL={remoteStream.toURL()}
                  style={{ width: "100%", height: "100%" }}
                  objectFit="cover"
                />
              ) : selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
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

              {isStreaming && (
                <View className="absolute top-5 left-5 bg-red-600 px-3 py-1 rounded-full flex-row items-center">
                  <View className="w-2 h-2 bg-white rounded-full mr-2" />
                  <Text className="text-white text-[14px] font-bold">LIVE</Text>
                </View>
              )}

              {/* 확대 힌트 */}
              {selectedImage && !isStreaming && (
                <View className="absolute bottom-3 right-3 bg-black/40 px-2 py-1 rounded-lg">
                  <Text className="text-white text-[10px]">탭하여 확대</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* 썸네일 목록 */}
          {imageList.length > 0 && (
            <View className="mt-3">
              <FlatList
                ref={flatListRef}
                data={imageList}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                  onPress={() => {
                    setSelectedImage(item);
                    setCurrentIndex(index);
                    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
                    autoSlideRef.current = setInterval(() => {
                      setCurrentIndex((prev) => {
                        const next = (prev + 1) % imageList.length;
                        setSelectedImage(imageList[next]);
                        flatListRef.current?.scrollToIndex({ index: next, animated: true });
                        return next;
                      });
                    }, 2000);
                  }}
                    className="mr-2"
                    style={{
                      borderWidth: currentIndex === index ? 2 : 0,
                      borderColor: "#5D60F1",
                      borderRadius: 8,
                    }}
                  >
                    <Image
                      source={{ uri: item }}
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                      resizeMode="cover"
                    />
                    <Text className="text-center text-[9px] text-gray-500 mt-0.5">
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* 자동 슬라이드 토글 */}
          {imageList.length > 1 && (
            <TouchableOpacity
              onPress={() => setAutoSlide((prev) => !prev)}
              className="flex-row items-center mt-2 self-end"
            >
              <Ionicons
                name={autoSlide ? "pause-circle" : "play-circle"}
                size={20}
                color="#5D60F1"
              />
              <Text className="text-xs text-[#5D60F1] ml-1">
                {autoSlide ? "자동 재생 중" : "자동 재생 멈춤"}
              </Text>
            </TouchableOpacity>
          )}

          {/* 수신 중 표시 */}
          {isReceivingImage && imageList.length > 0 && (
            <View className="flex-row items-center mt-1">
              <ActivityIndicator size="small" color="#5D60F1" />
              <Text className="text-xs text-gray-400 ml-2">
                {imageList.length}개 수신됨, 계속 수신 중...
              </Text>
            </View>
          )}

          {/* 상황 묘사 */}
          <View className="mt-3 bg-gray-100 p-4 rounded-2xl">
            <Text className="text-gray-500 text-xs mb-1">상황 요약</Text>
            <Text className="text-gray-800 font-semibold text-base">
              {korean_text || "상황 정보 없음"}
            </Text>
          </View>

          {/* 실시간 영상 보기 버튼 */}
          <TouchableOpacity
            className="mt-3 w-full h-14 bg-[#5D60F1] rounded-xl justify-center items-center"
            onPress={handleStartStreaming}
          >
            <Text className="text-white text-lg font-bold">실시간 영상 보기</Text>
          </TouchableOpacity>
        </View>

        {/* 확대 모달 */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            scale.value = 1;
            setModalVisible(false);
          }}
        >
          <View
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}
          >
            <TouchableOpacity
              style={{ position: "absolute", top: 50, right: 20, zIndex: 10 }}
              onPress={() => {
                scale.value = 1;
                setModalVisible(false);
              }}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>

            <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchEvent}>
              <Animated.View style={animatedStyle}>
                <Image
                  source={{ uri: selectedImage! }}
                  style={{ width: 350, height: 350 }}
                  resizeMode="contain"
                />
              </Animated.View>
            </PinchGestureHandler>

            <Text className="text-gray-400 text-xs mt-4">핀치로 확대/축소</Text>
          </View>
        </Modal>
      </ScreenContainer>
    </GestureHandlerRootView>
  );
}