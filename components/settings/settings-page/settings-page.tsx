import { React, useRef } from "../../../deps.ts";
import { usePageStack } from "../../../util/mod.ts";
import MenuItem from "../../base/menu-item/menu-item.tsx";
import Page from "../../base/page/page.tsx";
import AccountDetailsPage from "../account-details-page/account-details-page.tsx";

export default function SettingsPage() {
  const $$settingsPageBackRef = useRef<HTMLDivElement>(null)
  const { pushPage } = usePageStack();
  const { popPage } = usePageStack();

  const onBack = () => {
    console.log('on back', $$settingsPageBackRef.current)
    popPage()
    $$settingsPageBackRef.current?.focus()
  }

  return (
    <Page title="Settings" backIconRef={$$settingsPageBackRef}>
      <MenuItem
        icon="accountCircle"
        onClick={() => pushPage(<AccountDetailsPage />)}
        onBack={onBack}
      >
        Account details
      </MenuItem>
      {/* <MenuItem icon="notifications">Notifications</MenuItem>
      <MenuItem icon="smile">Emotes</MenuItem>
      <MenuItem icon="desktop">Connections</MenuItem> */}
    </Page>
  );
}
