import { React } from "../../../deps.ts";
import MenuItem from "../../base/menu-item/menu-item.tsx";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import AccountDetailsPage from "../account-details-page/account-details-page.tsx";

export default function SettingsPage() {
  const { pushPage } = usePageStack();

  return (
    <Page title="Settings">
      <MenuItem
        icon="accountCircle"
        onClick={() => pushPage(<AccountDetailsPage />)}
      >
        Account details
      </MenuItem>
      {
        /* <MenuItem icon="notifications">Notifications</MenuItem>
      <MenuItem icon="smile">Emotes</MenuItem>
      <MenuItem icon="desktop">Connections</MenuItem> */
      }
    </Page>
  );
}
