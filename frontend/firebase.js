/// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyAM6KjjyPd2o1OEbxAiEQowlaX3UebNvNs",
  authDomain: "smartnavfish-f1276.firebaseapp.com",
  projectId: "smartnavfish-f1276",
  storageBucket: "smartnavfish-f1276.firebasestorage.app",
  messagingSenderId: "291702284162",
  appId: "1:291702284162:web:6d26b60554f8a021cef99b",
  measurementId: "G-GP7CWPR14Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
