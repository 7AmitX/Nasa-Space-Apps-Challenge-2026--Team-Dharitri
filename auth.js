import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmkQb8hT4RDbO19kbQIRIhGjY8pIOnx28",
  authDomain: "rover-buddies.firebaseapp.com",
  projectId: "rover-buddies",
  storageBucket: "rover-buddies.firebasestorage.app",
  messagingSenderId: "702793437835",
  appId: "1:702793437835:web:8a7a70c0a9af2985c63a8e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

function show(text, type) {
  const m = $("message");
  m.textContent = text;
  m.className = "message " + type;
}

function friendlyError(code) {
  const errors = {
    "auth/email-already-in-use": "That email already has an account.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/too-many-requests": "Too many tries. Please wait a bit."
  };
  return errors[code] || "Something went wrong. Please try again.";
}

// Show / hide password (login + signup pages)
const toggle = $("togglePw");
if (toggle) {
  toggle.addEventListener("click", () => {
    const pw = $("password");
    const hidden = pw.type === "password";
    pw.type = hidden ? "text" : "password";
    toggle.textContent = hidden ? "Hide" : "Show";
  });
}

// SIGN UP
const signupForm = $("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("name").value.trim();
    const email = $("email").value.trim();
    const password = $("password").value;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, createdAt: serverTimestamp()
      });
      window.location.href = "welcome.html";
    } catch (err) {
      show(friendlyError(err.code), "error");
    }
  });
}

// LOGIN
const loginForm = $("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
      window.location.href = "welcome.html";
    } catch (err) {
      show(friendlyError(err.code), "error");
    }
  });
}

// WELCOME PAGE (protected)
const welcome = $("welcomeName");
if (welcome) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = "index.html");
    const snap = await getDoc(doc(db, "users", user.uid));
    welcome.textContent = snap.exists() ? snap.data().name : user.email;
  });
  $("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}
