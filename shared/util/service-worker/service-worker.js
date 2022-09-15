/**
 * We use this service worker to deliver push notifications to users
 * while they are not viewing a stream.
 */

importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCrlknC6fL012iV8vvX1jUcIFPfDJzBOJk",
  authDomain: "spore-gg.firebaseapp.com",
  projectId: "spore-gg",
  storageBucket: "spore-gg.appspot.com",
  messagingSenderId: "277610744288",
  appId: "1:277610744288:web:fbb43fc374b6f8ce5ac385",
  measurementId: "G-3QC8231033",
  vapidKey:
    "BIT0bxDZp5dHoHfNU_oCeUmOOY6qPNpsY2Y1PfcQviPaD0INH5T9_6Qr44lEGc0bpNRpa7Z8lXnKFP9AtL3v7NM",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages. This will generate a notification to display to the user if
// it receives a message while in the background.
firebase.messaging();

self.addEventListener("install", () => {
  console.log("Mogul menu service worker installed");
});
