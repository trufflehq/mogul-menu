import React, { useState } from "https://npm.tfl.dev/react";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@~0.1.0/utils/snack-bar.ts";

import Button from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/button/button.tsx";
import SnackBar from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/snack-bar/snack-bar.tsx";
import Dialog from "https://tfl.dev/@truffle/ui@~0.1.0/components/dialog/dialog.entry.js";

import { useTabState } from "../../util/tabs/tab-state.ts";
import { useTabId } from "../../util/tabs/tab-id.ts";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import { useActionBanner } from "../../util/action-banner/action-banner.ts";

import ChromeExtSettings from "../settings/settings.tsx";
import ActionBanner from "../action-banner/action-banner.tsx";
import { useDialog } from "../dialog-container/dialog-service.ts";
// import DialogDemo from "./radix-test.tsx";

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
      <SnackBar
        message={`Congrats! You won. ${count}`}
        messageBgColor="lightblue"
      />
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
        message="Finish setting up your account"
        buttonText="Sign up"
        onClick={() => removeActionBanner(actionBannerId)}
      />,
    );
  };

  // this uses the truffle UI dialog
  // const [isDialogHidden, setDialogHidden] = useState(true);
  // const toggleDialogHandler = () => setDialogHidden((prev: boolean) => !prev);
  // this uses the mogul-menu dialog service
  const toggleDialogHandler = () => {
    pushDialog(
      <div style={{ background: "white", color: "black" }}>I'm a dialog</div>,
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
        <Button
          onClick={snackBarHandler}
          isSelected={isSelected}
          text="Enqueue snackbar"
          transformHover="scale(103%)"
          backgroundSelected="var(--truffle-gradient)"
          transformSelected="scale(103%)"
          icon="https://cdn.bio/assets/images/features/browser_extension/gamepad.svg"
        />
        <Button onClick={tabNameHandler} text="Set tab name" />
        <Button onClick={pushPageHandler} text="Push page" />
        <Button onClick={actionBannerHandler} text="Show action banner" />
        <Button onClick={toggleDialogHandler} text="Show dialog" />
      </div>
      {
        /* <div>
        <DialogDemo />
      </div> */
      }
      {
        /* <Dialog hidden={isDialogHidden}>
        <Button onClick={toggleDialogHandler} text="Toggle dialog" />
      </Dialog> */
      }
    </div>
  );
}
