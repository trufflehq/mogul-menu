import { jumper, React, useEffect, useRef, useStyleSheet } from "../../deps.ts";
import styleSheet from "./menu.scss.js";

import DraggableMenu from "./draggable-menu/draggable-menu.tsx";
import Tabs from "../tabs/tabs.tsx";
import TabBar from "../tab-bar/tab-bar.tsx";
import AuthManager from "../auth-manager/auth-manager.tsx";
import ExtensionIcon from "./extension-icon/extension-icon.tsx";
import PageStack from "../page-stack/page-stack.tsx";
import { SnackBarContainer } from "../snackbar/mod.ts";
import { useInvalidate } from "../../shared/mod.ts";
import { ActionBannerContainer } from "../action-banner/mod.ts";
import DialogContainer from "../base/dialog-container/dialog-container.tsx";
import { MogulMenuProps } from "./menu.tsx";
export default function BrowserExtensionMenuBody(props: MogulMenuProps) {
  useStyleSheet(styleSheet);
  useInvalidate();

  return (
    <DraggableMenu {...props}>
      <div className="inner">
        <div className="bottom">
          <TabBar />
          <div className="extension-icon-placeholder"></div>
          <ExtensionIcon />
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
