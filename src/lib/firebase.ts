import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Initializing Firebase with config:", {
  ...firebaseConfig,
  apiKey: "[HIDDEN]",
  databaseURL: firebaseConfig.databaseURL, // Show this explicitly
});

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Test database connection
const testConnection = () => {
  const testRef = ref(database, ".info/connected");
  onValue(testRef, (snapshot) => {
    console.log("Database connection status:", snapshot.val());
  });
};

testConnection();

export { database };
