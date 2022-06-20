import React, { useState } from "react";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js";

import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx";
import SnackBar from "https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar/snack-bar.jsx";

import { useTabState } from "../../util/tabs/tab-state.ts";
import { useTabId } from "../../util/tabs/tab-id.ts";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import { useActionBanner } from "../../util/action-banner/action-banner.ts";

import ChromeExtSettings from "../settings/settings.tsx";
import ActionBanner from "../action-banner/action-banner.tsx";

export default function HomeTab() {
  const enqueueSnackBar = useSnackBar();
  const [count, setCount] = useState(0);
  const [isSelected, setSelected] = useState(false);

  const tabId = useTabId();
  const tabState = useTabState();

  const { pushPage, popPage } = usePageStack();

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
        onClick={() => {
          removeActionBanner(actionBannerId);
        }}
      />
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
      </div>
    </div>
  );
}
