import firebase from "firebase/compat/app";
import "firebase/compat/auth"
import "firebase/compat/database"
import "firebase/compat/firestore"
import "firebase/compat/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDSwoYJ9tDOp0R1SWPUQ7DY4L_EDnZxngM",
  authDomain: "chat-app-8e945.firebaseapp.com",
  databaseURL: "https://chat-app-8e945-default-rtdb.firebaseio.com",
  projectId: "chat-app-8e945",
  storageBucket: "chat-app-8e945.appspot.com",
  messagingSenderId: "316800713115",
  appId: "1:316800713115:web:7d63f0ba0446f96e13613e"
};


firebase.initializeApp(firebaseConfig);
export const db = firebase.database()
export const auth = firebase.auth();
export const storage = firebase.storage();
export const firestore = firebase.firestore();
export default firebase
