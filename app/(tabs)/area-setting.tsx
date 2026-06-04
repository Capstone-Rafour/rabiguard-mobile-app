import AddAreaModal from "@/components/add-area-modal";
import ScreenContainer from "@/components/screen-container";
import { db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import database from "@react-native-firebase/database";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

interface ZoneData {
  id: string;
  className: string;
  isActive: boolean;
  box: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export default function AreaSettingScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [autoZones, setAutoZones] = useState<ZoneData[]>([]);
  const [manualZones, setManualZones] = useState<ZoneData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🛠️ 드래그 상태 관리
  const [isDragging, setIsDragging] = useState(false);
  const [dragBox, setDragBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const chunksRef = useRef<Uint8Array[]>([]);
  const pcRef = useRef<any>(null);

  const startCoords = useRef({ x: 0, y: 0 });
  const currentDragBoxRef = useRef<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const SERVER_WIDTH = 640;
  const SERVER_HEIGHT = 480;
  const APP_IMAGE_HEIGHT = 256;
  const APP_IMAGE_WIDTH = screenWidth - 48;

  const scaleX = APP_IMAGE_WIDTH / SERVER_WIDTH;
  const scaleY = APP_IMAGE_HEIGHT / SERVER_HEIGHT;

  useEffect(() => {
    setIsLoading(true);

    const autoRef = collection(db, "auto_zones");
    const unsubscribeAuto = onSnapshot(autoRef, (snapshot) => {
      setAutoZones(parseSnapshot(snapshot));
    });

    const manualRef = collection(db, "manual_zones");
    const unsubscribeManual = onSnapshot(manualRef, (snapshot) => {
      setManualZones(parseSnapshot(snapshot));
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuto();
      unsubscribeManual();
    };

  }, [screenWidth]);

  const parseSnapshot = (snapshot: any): ZoneData[] => {
    return snapshot.docs.map((docSnap: any) => {
      const data = docSnap.data();
      const polygon = data.polygon || [];

      const xValues = polygon.map((p: any) => p.x);
      const yValues = polygon.map((p: any) => p.y);

      const minX = xValues.length ? Math.min(...xValues) : 0;
      const maxX = xValues.length ? Math.max(...xValues) : 100;
      const minY = yValues.length ? Math.min(...yValues) : 0;
      const maxY = yValues.length ? Math.max(...yValues) : 100;

      return {
        id: docSnap.id,
        className: data.class_name || "지정 구역",
        isActive: data.is_active ?? true,
        box: {
          left: minX * scaleX,
          top: minY * scaleY,
          width: Math.max((maxX - minX) * scaleX, 40),
          height: Math.max((maxY - minY) * scaleY, 30),
        },
      };
    });
  };

  const captureAndReceiveImage = async () => {
    try {
      await firestore().collection("commands").add({
        type: "trigger_roi",
        created_at: firestore.FieldValue.serverTimestamp(),
      });
  
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
  
      startImageConnection();
    } catch (e) {
      console.warn("이미지 캡처 실패:", e);
    }
  };

  const startImageConnection = async () => {
    await database().ref("signaling/smart_cctv/data_offer").remove();
    await database().ref("signaling/smart_cctv/data_answer").remove();
    await database().ref("signaling/smart_cctv/data_status").remove();
  
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    }) as any;
    pcRef.current = pc;
  
    const dc = pc.createDataChannel("file-transfer");
    dc.binaryType = "arraybuffer";
  
    dc.onmessage = (e: any) => {
      const data = e.data;
  
      if (typeof data === "string") {
        try {
          const msg = JSON.parse(data);
  
          if (msg.type === "file_start") {
            chunksRef.current = [];
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
            setCameraImage(`data:image/jpeg;base64,${base64}`);
            chunksRef.current = [];
          } else if (msg.type === "transfer_end") {
            pc.close();
          }
        } catch {}
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
      }
    });
  };

  const handleRequestImage = async () => {
    setIsLoading(true);
    try {
      await captureAndReceiveImage();
    } finally {
      setIsLoading(false);
    }
  };

  // 🛠️ 치트키: PanResponder 대신 View 자체의 네이티브 터치 이벤트 핸들러 사용
  const handleTouchStart = (evt: any) => {
    if (mode !== "manual") return;

    // 타겟 뷰 기준의 상대 좌표 추출
    const { locationX, locationY } = evt.nativeEvent;
    startCoords.current = { x: locationX, y: locationY };
    setIsDragging(true);

    const initialBox = { top: locationY, left: locationX, width: 0, height: 0 };
    currentDragBoxRef.current = initialBox;
    setDragBox(initialBox);
  };

  const handleTouchMove = (evt: any) => {
    if (mode !== "manual" || !isDragging) return;

    const { locationX, locationY } = evt.nativeEvent;

    const left = Math.min(startCoords.current.x, locationX);
    const top = Math.min(startCoords.current.y, locationY);
    const width = Math.abs(startCoords.current.x - locationX);
    const height = Math.abs(startCoords.current.y - locationY);

    // 경계선 방어
    if (
      left >= 0 &&
      top >= 0 &&
      left + width <= APP_IMAGE_WIDTH &&
      top + height <= APP_IMAGE_HEIGHT
    ) {
      const updatedBox = { top, left, width, height };
      currentDragBoxRef.current = updatedBox;
      setDragBox(updatedBox);
    }
  };

  const handleTouchEnd = () => {
    if (mode !== "manual" || !isDragging) return;

    setIsDragging(false);
    const finalBox = currentDragBoxRef.current;

    if (finalBox && finalBox.width > 10 && finalBox.height > 10) {
      setIsModalVisible(true);
    } else {
      setDragBox(null);
      currentDragBoxRef.current = null;
    }
  };

  const handleToggleZone = async (
    collectionName: "auto_zones" | "manual_zones",
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const zoneDocRef = doc(db, collectionName, id);
      await updateDoc(zoneDocRef, { is_active: !currentStatus });
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
    }
  };

  const handleSaveManualArea = async (name: string) => {
    const finalBox = currentDragBoxRef.current;
    if (!finalBox) return;

    try {
      const serverLeft = finalBox.left / scaleX;
      const serverTop = finalBox.top / scaleY;
      const serverWidth = finalBox.width / scaleX;
      const serverHeight = finalBox.height / scaleY;

      const polygon = [
        { x: Math.round(serverLeft), y: Math.round(serverTop) },
        { x: Math.round(serverLeft + serverWidth), y: Math.round(serverTop) },
        {
          x: Math.round(serverLeft + serverWidth),
          y: Math.round(serverTop + serverHeight),
        },
        { x: Math.round(serverLeft), y: Math.round(serverTop + serverHeight) },
      ];

      await addDoc(collection(db, "manual_zones"), {
        class_name: name,
        is_active: true,
        polygon: polygon,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error("수동 구역 저장 실패:", error);
    } finally {
      setDragBox(null);
      currentDragBoxRef.current = null;
      setIsModalVisible(false);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-4">
        {/* 헤더 영역*/}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">구역 설정</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isDragging}
        >
          {/* 카메라 뷰 및 드래그 영역 */}
          <View
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative mt-4 rounded-3xl overflow-hidden shadow-md bg-gray-200"
            style={[
              { width: APP_IMAGE_WIDTH, height: APP_IMAGE_HEIGHT },
              { cursor: mode === "manual" ? "crosshair" : "default" } as any,
            ]}
          >
            {/* 배경 이미지 레이어 */}
            <View className="absolute inset-0" pointerEvents="none">
              <Image
                source={
                  cameraImage
                    ? { uri: cameraImage }
                    : { uri: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop" }
                }
                className="w-full h-full"
              />
            </View>

            {isLoading ? (
              <View
                className="absolute inset-0 justify-center items-center bg-black/10"
                pointerEvents="none"
              >
                <ActivityIndicator size="large" color="#5D60F1" />
              </View>
            ) : (
              <View className="absolute inset-0" pointerEvents="none">
                {/* 1) 자동 감지 박스 */}
                {mode === "auto" &&
                  autoZones.map((zone) => {
                    if (!zone.isActive) return null;
                    return (
                      <View
                        key={zone.id}
                        className="absolute border-2 border-red-500 rounded-lg p-0.5"
                        style={{
                          left: zone.box.left,
                          top: zone.box.top,
                          width: zone.box.width,
                          height: zone.box.height,
                        }}
                      >
                        <View className="bg-red-500 self-start px-1 rounded-sm">
                          <Text className="text-white text-[10px] font-bold">
                            {zone.className}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                {/* 2) 수동 저장된 박스 */}
                {mode === "manual" &&
                  manualZones.map((zone) => {
                    if (!zone.isActive) return null;
                    return (
                      <View
                        key={zone.id}
                        className="absolute border-2 border-[#5D60F1] rounded-lg p-0.5"
                        style={{
                          left: zone.box.left,
                          top: zone.box.top,
                          width: zone.box.width,
                          height: zone.box.height,
                        }}
                      >
                        <View className="bg-[#5D60F1] self-start px-1 rounded-sm">
                          <Text className="text-white text-[10px] font-bold">
                            {zone.className}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                {/* 3) 실시간 드래그 점선 가이드 상자 */}
                {mode === "manual" && dragBox && (
                  <View
                    className="absolute border-2 border-dashed border-[#5D60F1] bg-[#5D60F1]/10"
                    style={{
                      left: dragBox.left,
                      top: dragBox.top,
                      width: dragBox.width,
                      height: dragBox.height,
                    }}
                  />
                )}
              </View>
            )}
          </View>

          {/* 자동/수동 탭 */}
          <View className="flex-row bg-gray-100 rounded-2xl p-1 mt-6">
            <TouchableOpacity
              onPress={() => setMode("auto")}
              className={`flex-1 py-3 rounded-xl ${mode === "auto" ? "bg-white" : ""}`}
              style={mode === "auto" ? { elevation: 2 } : {}}
            >
              <Text
                className={`text-center font-bold ${mode === "auto" ? "text-black" : "text-gray-400"}`}
              >
                자동 설정
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("manual")}
              className={`flex-1 py-3 rounded-xl ${mode === "manual" ? "bg-white" : ""}`}
              style={mode === "manual" ? { elevation: 2 } : {}}
            >
              <Text
                className={`text-center font-bold ${mode === "manual" ? "text-black" : "text-gray-400"}`}
              >
                수동 설정
              </Text>
            </TouchableOpacity>
          </View>

          {/* 하단 리스트 영역 */}
          <View className="mt-6">
            {mode === "auto" ? (
              <View>
                <View className="mb-4">
                  <TouchableOpacity
                    onPress={handleRequestImage}
                    disabled={isLoading}
                    className="bg-[#5D60F1] rounded-3xl px-4 py-4 items-center"
                    style={isLoading ? { opacity: 0.7 } : {}}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-bold">사진 요청</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {autoZones.length > 0 ? (
                  <View className="bg-white rounded-3xl p-2 border border-gray-100">
                    {autoZones.map((zone) => (
                      <ObjectRow
                        key={zone.id}
                        name={zone.className}
                        status={zone.isActive ? "On" : "Off"}
                        onToggle={() =>
                          handleToggleZone("auto_zones", zone.id, zone.isActive)
                        }
                      />
                    ))}
                  </View>
                ) : (
                  <View className="bg-white rounded-3xl p-8 border border-gray-100 items-center">
                    <Text className="text-gray-400">
                      인식된 자동 구역이 없습니다.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <View className="bg-gray-50 border border-dashed border-gray-200 py-4 rounded-2xl items-center mb-4">
                  <Text className="text-gray-500 font-medium text-sm">
                    카메라 영상 위를 드래그하면 구역이 추가됩니다.
                  </Text>
                </View>

                {manualZones.length > 0 && (
                  <View className="bg-white rounded-3xl p-2 border border-gray-100">
                    {manualZones.map((zone) => (
                      <ObjectRow
                        key={zone.id}
                        name={zone.className}
                        status={zone.isActive ? "On" : "Off"}
                        onToggle={() =>
                          handleToggleZone(
                            "manual_zones",
                            zone.id,
                            zone.isActive,
                          )
                        }
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <AddAreaModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setDragBox(null);
          currentDragBoxRef.current = null;
        }}
        onSave={handleSaveManualArea}
      />
    </ScreenContainer>
  );
}

function ObjectRow({
  name,
  status,
  onToggle,
}: {
  name: string;
  status: string;
  onToggle?: () => void;
}) {
  const isOn = status === "On";

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={!onToggle}
      className="flex-row items-center justify-between p-5 border-b border-gray-50 last:border-0"
    >
      <Text
        className={`text-[17px] font-medium ${isOn ? "text-gray-800" : "text-gray-400"}`}
      >
        {name}
      </Text>
      <View className="flex-row items-center">
        <Switch
          trackColor={{ false: "#E5E7EB", true: "#C7C9FB" }}
          thumbColor={isOn ? "#5D60F1" : "#9CA3AF"}
          ios_backgroundColor="#E5E7EB"
          value={isOn}
          onValueChange={onToggle}
        />
      </View>
    </TouchableOpacity>
  );
}
