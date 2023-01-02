import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../config";

console.log(firebaseConfig);
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
export { auth };