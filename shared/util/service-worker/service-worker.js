/**
 * We use this service worker to deliver push notifications to users
 * while they are not viewing a stream.
 */

import { TRUFFLE_FIREBASE_CONFIG } from "../firebase/config.js";
import { initializeApp } from "https://npm.tfl.dev/firebase@9.9.4/app";
import { getMessaging } from "https://npm.tfl.dev/firebase@9.9.4/messaging/sw";

initializeApp(TRUFFLE_FIREBASE_CONFIG);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages. This will generate a notification to display to the user if
// it receives a message while in the background.
getMessaging();

self.addEventListener("install", () => {
  console.log("Mogul menu service worker installed");
});
