import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBL_Rww3GKGXxXIJw0AI9xYaKxzRQtXuwY",
  authDomain: "grooming-centre-5a694.firebaseapp.com",
  projectId: "grooming-centre-5a694",
  storageBucket: "grooming-centre-5a694.firebasestorage.app",
  messagingSenderId: "1000698209312",
  appId: "1:1000698209312:web:bc9b586d60e57ac4024845",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
