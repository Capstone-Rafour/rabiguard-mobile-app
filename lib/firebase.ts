import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChEshLIx1iHyMcv4tis80YC-wPIik3qJ0",
  authDomain: "rafour-7f37f.firebaseapp.com",
  projectId: "rafour-7f37f",
  storageBucket: "afour-7f37f.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:604898711461:ios:cd6915840fe112bdf9ba4c",
};

// 앱 초기화 및 엔진 내보내기
const app =
  firebase.apps.length === 0
    ? firebase.initializeApp(firebaseConfig)
    : firebase.app();

export const auth = firebase.auth();
export const db = firebase.firestore();
