import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSM6DObuhPjCeP3HaSFLRVrgg3854y3mU",
  authDomain: "dharmadhwajam-f50ff.firebaseapp.com",
  projectId: "dharmadhwajam-f50ff",
  storageBucket: "dharmadhwajam-f50ff.firebasestorage.app",
  messagingSenderId: "973199846877",
  appId: "1:973199846877:web:7be2aee596559cf6385a34"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);