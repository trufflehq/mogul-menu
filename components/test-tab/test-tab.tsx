import { React, useState } from "../../deps.ts";
import { useSnackBar } from "../../util/snack-bar/snack-bar.ts";

import Button from "../base/button/button.tsx";
import SnackBar from "../base/snack-bar/snack-bar.tsx";
import Dialog from "../base/dialog/dialog.tsx";

import { useTabState } from "../../util/tabs/tab-state.ts";
import { useTabId } from "../../util/tabs/tab-id.ts";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import { useActionBanner } from "../../util/action-banner/action-banner.ts";

import ChromeExtSettings from "../settings/settings.tsx";
import ActionBanner from "../action-banner/action-banner.tsx";
import { useDialog } from "../base/dialog-container/dialog-service.ts";
import DefaultDialogContentFragment from "../dialogs/content-fragments/default/default-dialog-content-fragment.tsx";
import Switch from "../base/switch/switch.tsx";

export default function HomeTab() {
  const enqueueSnackBar = useSnackBar();
  const [count, setCount] = useState(0);
  const [isSelected, setSelected] = useState(false);

  const tabId = useTabId();
  const tabState = useTabState();

  const { pushPage, popPage } = usePageStack();
  const { pushDialog, popDialog } = useDialog();

  const { displayActionBanner, removeActionBanner } = useActionBanner();

  const snackBarHandler = () => {
    console.log("enqueueing snackbar");
    enqueueSnackBar(() => (
      <SnackBar message={`Congrats! You won. ${count}`} value="1000 cp" />
    ));
    setCount((prev) => prev + 1);
    setSelected((prev) => !prev);
  };

  const tabNameHandler = () => {
    tabState.setTabText(`Home (${count})`);
    tabState.setTabBadge(isSelected);
    setCount((prev) => prev + 1);
    setSelected((prev) => !prev);
  };

  const pushPageHandler = () => {
    pushPage(<ChromeExtSettings nonce={1} />);
  };

  const actionBannerHandler = () => {
    const actionBannerId = displayActionBanner(
      <ActionBanner
        action={
          <Button onClick={() => removeActionBanner(actionBannerId)}></Button>
        }
      >
        Finish setting up your account
      </ActionBanner>
    );
  };

  // this uses the truffle UI dialog
  // const [isDialogHidden, setDialogHidden] = useState(true);
  // const toggleDialogHandler = () => setDialogHidden((prev: boolean) => !prev);

  // this uses the mogul-menu dialog service
  const toggleDialogHandler = () => {
    pushDialog(
      <Dialog
        actions={[
          <Button style="bg-tertiary">Close</Button>,
          <Button style="primary">Accept</Button>,
        ]}
      >
        <DefaultDialogContentFragment
          imageUrl="https://cdn.bio/ugc/collectible/d57969e0-c675-11ec-8e89-9f132b527070.svg"
          primaryText="Hello"
          secondaryText="How are you?"
        />
      </Dialog>
    );
  };

  return (
    <div className="z-home-tab">
      <div className="truffle-text-header-1">Tab id: {tabId}</div>
      <div className="truffle-text-header-1">Tab name: {tabState.text}</div>
      <div className="truffle-text-header-1">
        Tab isActive: {String(tabState.isActive)}
      </div>
      <div>
        <Button onClick={snackBarHandler}>Enqueue snackbar</Button>
        <Button onClick={tabNameHandler}>Set tab name</Button>
        <Button onClick={pushPageHandler}>Push page</Button>
        <Button onClick={actionBannerHandler}>Show action banner</Button>
        <Button onClick={toggleDialogHandler}>Show dialog</Button>
      </div>
      <Switch value={true} />
    </div>
  );
}
