import { useEffect, useState } from "../../../deps.ts";
import { useFcmTokenManager } from "../../mod.ts";

export function useNotificationTopics() {
  // TODO: query this info from mycelium

  const fetching = false;
  const notificationTopics = [
    {
      id: "1",
      slug: "stream-live",
      name: "Stream live",
      mediumId: "fcmId",
      isSubscribed: true,
    },
    {
      id: "2",
      slug: "stream-pre-chat",
      name: "Stream pre-chat",
      mediumId: "fcmId",
      isSubscribed: true,
    },
    {
      id: "3",
      slug: "ludwig-main-new-video",
      name: "Ludwig Main: new video",
      mediumId: "fcmId",
      isSubscribed: true,
    },
    {
      id: "4",
      slug: "ludwig-clips-new-video",
      name: "Ludwig Clips: new video",
      mediumId: "fcmId",
      isSubscribed: true,
    },
    {
      id: "5",
      slug: "yard-new-video",
      name: "The Yard: new video",
      mediumId: "fcmId",
      isSubscribed: true,
    },
    {
      id: "6",
      slug: "updates",
      name: "Updates",
      mediumId: "fcmId",
      isSubscribed: true,
    },
  ];
  return { notificationTopics, fetching };
}

export function useFcmNotificationMediumConfig(token: string | undefined) {
  // TODO: wire up to mycelium so that it reads from and saves to
  // a NotificationMediumUserConfig
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);
  const registerToken = () => {
    if (token) {
      console.log("registering fcmToken with mycelium");
      setIsTokenRegistered(true);
    }
  };

  const unregisterToken = () => {
    if (token) {
      console.log("unregistering fcmToken with mycelium");
      setIsTokenRegistered(false);
    }
  };

  return { isTokenRegistered, registerToken, unregisterToken };
}

export function useDesktopNotificationSetting() {
  const { fcmToken, requestNotificationPermission, notificationPermission } = useFcmTokenManager();
  const { isTokenRegistered, registerToken, unregisterToken } = useFcmNotificationMediumConfig(
    fcmToken,
  );

  const isDesktopNotificationsEnabled = isTokenRegistered && notificationPermission === "granted";
  const setDesktopNotificationPref = (enable: boolean) => {
    // enable desktop notifications
    if (enable) {
      // alert them if they haven't enabled browser notification perms
      if (notificationPermission === "default") {
        // TODO: make this a prettier dialog
        alert("Please allow notifications in your browser first.");
      } else if (notificationPermission === "denied") {
        // TODO: make this a prettier dialog
        alert(
          "It looks like you have explicitly denied notifications for this site. Please enable them in your browser settings.",
        );
        return;
      }

      registerToken();

      // disable desktop notifications
    } else {
      unregisterToken();
    }
  };

  // prompt the user to enable desktop notifications if they haven't done so
  useEffect(() => {
    if (notificationPermission === "default") {
      requestNotificationPermission();
    }
  }, [notificationPermission]);

  return { isDesktopNotificationsEnabled, setDesktopNotificationPref };
}
