// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCibekWnkYu-7MAYkoEE5JjOA1ag6zWhD8",
  authDomain: "practicehotel-management.firebaseapp.com",
  projectId: "practicehotel-management",
  storageBucket: "practicehotel-management.appspot.com",
  messagingSenderId: "573277649073",
  appId: "1:573277649073:web:f91dcbaab0dee629044a90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);