import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, applicationDefault } from "firebase-admin/app";

const app = initializeApp({
 credential: applicationDefault(),
 databaseURL: "https://hackaton-chainlink.firebaseio.com",
});

export const auth = getAuth(app);
export const db = getFirestore(app);

