import { useEffect, useState } from "../../../deps.ts";
import { useServiceWorker } from "../mod.ts";
import { getFCMMessaging, getFCMToken } from "../../../deps.ts";
import { TRUFFLE_FIREBASE_CONFIG } from "./config.js";
import { useFirebase } from "./app.ts";

interface UseFcmTokenResult {
  requestNotificationPermission: () => Promise<void>;
  fcmToken: string;
  notificationPermission: NotificationPermission;
}

export function useFcmTokenManager(): UseFcmTokenResult {
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
    if (
      firebaseApp &&
      swRegistration &&
      notificationPermission === "granted"
    ) {
      const messaging = getFCMMessaging(firebaseApp);
      getFCMToken(messaging, {
        vapidKey: TRUFFLE_FIREBASE_CONFIG.vapidKey,
        serviceWorkerRegistration: swRegistration,
      }).then((token: string) => {
        setFcmToken(token);
      });
    }
  }, [notificationPermission, firebaseApp, swRegistration]);

  return { requestNotificationPermission, notificationPermission, fcmToken };
}
