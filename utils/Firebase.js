import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "rustynkart.firebaseapp.com",
  projectId: "rustynkart",
  storageBucket: "rustynkart.appspot.com",
  messagingSenderId: "878789275238",
  appId: "1:878789275238:web:d9955f18ebcb48f3f8c7a7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log("Firebase App Initialized:", app.name);

export { auth, provider, app };
