import { React, useRef, useStyleSheet } from "../../deps.ts";
import styleSheet from "./menu.scss.js";

import DraggableMenu from "./draggable-menu.tsx";
import Tabs from "../tabs/tabs.tsx";
import TabBar from "../tab-bar/tab-bar.tsx";
import AuthManager from "../auth-manager/auth-manager.tsx";
import ExtensionIcon from "../extension-icon/extension-icon.tsx";
import PageStack from "../page-stack/page-stack.tsx";
import SnackBarContainer from "../base/snack-bar-container/snack-bar-container.tsx";
import ActionBannerContainer from "../action-banner-container/action-banner-container.tsx";
import DialogContainer from "../base/dialog-container/dialog-container.tsx";

export default function BrowserExtensionMenuBody() {
  useStyleSheet(styleSheet);
  const $$extensionIconRef = useRef(null);

  return (
    <DraggableMenu>
      <div className="inner">
        <div className="bottom">
          <TabBar />
          <div className="extension-icon-placeholder"></div>
          <ExtensionIcon $$extensionIconRef={$$extensionIconRef} />
        </div>
        <div className="body">
          <AuthManager />
          <DialogContainer />
          <PageStack />
          <ActionBannerContainer />
          <SnackBarContainer />
          <Tabs />
        </div>
      </div>
    </DraggableMenu>
  );
}
