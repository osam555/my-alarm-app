import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDOC_EXAMPLE_KEY",
  authDomain: "my-alarm-5fb86.firebaseapp.com",
  projectId: "my-alarm-5fb86",
  storageBucket: "my-alarm-5fb86.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
