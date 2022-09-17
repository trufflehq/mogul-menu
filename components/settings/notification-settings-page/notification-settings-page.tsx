import { React, useStyleSheet } from "../../../deps.ts";
import { useNotificationTopics } from "../../../shared/util/notifications/hooks.ts";
import { useDesktopNotificationSetting } from "../../../shared/mod.ts";
import Switch from "../../base/switch/switch.tsx";
import Page from "../../page-stack/page.tsx";
import styleSheet from "./notification-settings-page.scss.js";
import { NotificationTopic } from "../../../types/notification.types.ts";

export default function NotificationSettingsPage() {
  useStyleSheet(styleSheet);

  const {
    notificationTopics,
    subscribeToNotificationTopic,
    unSubscribeFromNotificationTopic,
  } = useNotificationTopics();
  const { isDesktopNotificationsEnabled, setDesktopNotificationPref } =
    useDesktopNotificationSetting();

  const subscriptionSwitchToggleHandler = async (
    topic: NotificationTopic,
    subscribe: boolean
  ) => {
    if (subscribe) {
      await subscribeToNotificationTopic(topic);
    } else {
      await unSubscribeFromNotificationTopic(topic);
    }
  };

  return (
    <Page title="Notifications">
      <div className="notifications-page-body">
        <div className="push-notifications">
          <div className="title mm-text-header-caps">
            Desktop notifications
            <div className="input">
              <Switch
                value={isDesktopNotificationsEnabled}
                onChange={setDesktopNotificationPref}
              />
            </div>
          </div>
          <div className="description mm-text-body-1">
            Enable to receive notifications while you're not viewing a stream
          </div>
        </div>
        <div className="notification-topics">
          <div className="title mm-text-header-caps">Notifications</div>
          <div className="description mm-text-body-1">
            Choose which notifications to receive
          </div>
          <div className="notification-topic-setting-rows">
            {notificationTopics?.map((topic) => (
              <div className="row">
                <div className="name">{topic.name}</div>
                <div className="input">
                  <Switch
                    value={topic.isSubscribed}
                    onChange={(enabled: boolean) =>
                      subscriptionSwitchToggleHandler(topic, enabled)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
