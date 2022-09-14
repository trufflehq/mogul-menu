import { useEffect, useState } from "../../../deps.ts";
import { useServiceWorker } from "../mod.ts";
import { getFCMMessaging, getFCMToken } from "../../../deps.ts";
import { TRUFFLE_FIREBASE_CONFIG } from "./config.js";
import { useFirebase } from "./app.ts";

export function useFcmTokenManager() {
  const { swRegistration } = useServiceWorker();
  const [fcmToken, setFcmToken] = useState();
  const [notificationPermission, setNotificationPermission] = useState(() =>
    Notification.permission
  );
  const { firebaseApp } = useFirebase();

  const requestNotificationPermission = async () => {
    // make sure we have browser-level notification perms
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  // listen to the notification permission state and get an
  // fcm token if the user granted notification permissions
  useEffect(() => {
    if (notificationPermission === "granted" && firebaseApp) {
      const messaging = getFCMMessaging(firebaseApp);
      getFCMToken(messaging, {
        vapidKey: TRUFFLE_FIREBASE_CONFIG.vapidKey,
        serviceWorkerRegistration: swRegistration,
      }).then((token: string) => {
        setFcmToken(token);
      });
    }
  }, [notificationPermission, firebaseApp]);

  return { requestNotificationPermission, notificationPermission, fcmToken };
}
