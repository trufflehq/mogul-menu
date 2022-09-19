import { React, useExtensionInfo, semver } from "../../../deps.ts";
import MenuItem from "../../base/menu-item/menu-item.tsx";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import AccountDetailsPage from "../account-details-page/account-details-page.tsx";
import NotificationSettingsPage from "../notification-settings-page/notification-settings-page.tsx";

export default function SettingsPage() {
  const { pushPage } = usePageStack();

  // notifications are currently only supported in google chrome
  const isGoogleChrome = window.navigator.vendor === "Google Inc.";

  // make sure the extension supports notifications (version 3.3.4)
  const { extensionInfo } = useExtensionInfo();
  const supportsNotifications =
    extensionInfo && semver.satisfies(extensionInfo.version, ">=3.3.4");

  return (
    <Page title="Settings">
      <MenuItem
        icon="accountCircle"
        onClick={() => pushPage(<AccountDetailsPage />)}
      >
        Account details
      </MenuItem>
      {
        isGoogleChrome && supportsNotifications && (
          <MenuItem
            icon="notifications"
            onClick={() => pushPage(<NotificationSettingsPage />)}
          >
            Notifications
          </MenuItem>
        )
        /* <MenuItem icon="smile">Emotes</MenuItem>
      <MenuItem icon="desktop">Connections</MenuItem> */
      }
    </Page>
  );
}
