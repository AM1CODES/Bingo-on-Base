import { DatabaseReference, DataSnapshot } from "firebase/database";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export type FirebaseReference = DatabaseReference;
export type FirebaseSnapshot = DataSnapshot;
