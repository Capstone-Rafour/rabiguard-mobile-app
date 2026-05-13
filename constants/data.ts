export interface RecordItem {
  id: string;
  location: string;
  description: string;
  timestamp: string;
  eventType: string;
  stayTime?: string;
  peopleCount?: string;
  outfit?: string;
  ageGroup?: string;
}

export const MOCK_DATA: RecordItem[] = [
  {
    id: "1",
    location: "소파",
    description: "체류 시간 15분 / 1명",
    timestamp: "2026.03.27, 12:30:00",
    eventType: "특별 조건",
    // 상세 페이지용 추가 필드
    stayTime: "15분",
    peopleCount: "1명",
    outfit: "빨간색 셔츠에 흰색 바지",
    ageGroup: "어른",
  },
  {
    id: "2",
    location: "식탁",
    description: "이벤트 감지",
    timestamp: "2026.03.27, 11:45:00",
    eventType: "빠른 조건",
    stayTime: "2분",
    peopleCount: "1명",
    outfit: "청색 남방",
    ageGroup: "어른",
  },
  {
    id: "3",
    location: "침대",
    description: "움직임 없음",
    timestamp: "2026.03.27, 10:20:00",
    eventType: "빠른 조건",
    stayTime: "1시간",
    peopleCount: "1명",
    outfit: "회색 잠옷",
    ageGroup: "노인",
  },
  {
    id: "4",
    location: "현관",
    description: "출입 감지",
    timestamp: "2026.03.27, 09:15:00",
    eventType: "빠른 조건",
    stayTime: "30초",
    peopleCount: "1명",
    outfit: "검정색 코트",
    ageGroup: "어른",
  },
  {
    id: "5",
    location: "부엌",
    description: "체류 시간 5분 / 2명",
    timestamp: "2026.03.27, 08:50:00",
    eventType: "특별 조건",
    stayTime: "5분",
    peopleCount: "2명",
    outfit: "앞치마, 노란색 티셔츠",
    ageGroup: "어른",
  },
  {
    id: "6",
    location: "소파",
    description: "체류 시간 30분 / 1명",
    timestamp: "2026.03.27, 07:30:00",
    eventType: "특별 조건",
    stayTime: "30분",
    peopleCount: "1명",
    outfit: "흰색 원피스",
    ageGroup: "아이",
  },
  {
    id: "7",
    location: "서재",
    description: "이벤트 감지",
    timestamp: "2026.03.27, 06:10:00",
    eventType: "빠른 조건",
    stayTime: "45분",
    peopleCount: "1명",
    outfit: "안경, 체크 셔츠",
    ageGroup: "어른",
  },
  {
    id: "8",
    location: "거실",
    description: "움직임 감지",
    timestamp: "2026.03.27, 05:00:00",
    eventType: "빠른 조건",
    stayTime: "10분",
    peopleCount: "0명(사물)",
    outfit: "해당 없음",
    ageGroup: "-",
  },
  {
    id: "9",
    location: "화장실",
    description: "출입 감지",
    timestamp: "2026.03.27, 03:45:00",
    eventType: "빠른 조건",
    stayTime: "5분",
    peopleCount: "1명",
    outfit: "파란색 반바지",
    ageGroup: "청소년",
  },
  {
    id: "10",
    location: "침대",
    description: "취침 시작",
    timestamp: "2026.03.27, 01:20:00",
    eventType: "특별 조건",
    stayTime: "7시간",
    peopleCount: "1명",
    outfit: "잠옷",
    ageGroup: "어른",
  },
];
