import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export async function register(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    alert("Registered successfully!");
    return userCred.user;
  } catch (err) {
    alert("Registration failed: " + err.message);
  }
}

export async function login(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    return userCred.user;
  } catch (err) {
    alert("Login failed: " + err.message);
  }
}
