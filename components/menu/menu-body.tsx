import { React, useRef, classKebab, useStyleSheet } from "../../deps.ts";
import styleSheet from "./menu.scss.js";

import {
  getDimensions,
  getHasNotification,
  getIsOpen,
  getMenuPosition,
  getMenuState,
  useMenu,
  useTabStateManager,
} from "../../util/mod.ts";
import SnackBarProvider from "../base/snack-bar-provider/snack-bar-provider.tsx";
import Draggable from "../draggable/draggable.tsx";
import Tabs from "../tabs/tabs.tsx";
import TabBar from "../tab-bar/tab-bar.tsx";
import AuthManager from "../auth-manager/auth-manager.tsx";
import ExtensionIcon from "../extension-icon/extension-icon.tsx";
import PageStack from "../page-stack/page-stack.tsx";
import ActionBannerContainer from "../action-banner-container/action-banner-container.tsx";
import DialogContainer from "../base/dialog-container/dialog-container.tsx";

export default function BrowserExtensionMenuBody() {
  useStyleSheet(styleSheet);
  const $$extensionIconRef = useRef(null);
  const { store } = useTabStateManager();
  const { store: menuStore } = useMenu();
  const hasNotification = getHasNotification(store);

  const isOpen = getIsOpen(menuStore);
  const menuPosition = getMenuPosition(menuStore);

  const className = `c-browser-extension-menu position-${menuPosition} ${
    classKebab(
      { isOpen, hasNotification },
    )
  }`;

  return (
    <Draggable
      requiredClassName="extension-icon"
      ignoreClassName="c-browser-extension-menu"
    >
      <div className={className}>
        <div className="menu">
          <div className="inner">
            <div className="bottom">
              <TabBar />
              <div className="extension-icon-placeholder"></div>
              <ExtensionIcon $$extensionIconRef={$$extensionIconRef} />
            </div>
            <div className="body">
              <ActionBannerContainer />
              <PageStack />
              <div className="tab-body">
                <AuthManager />
                <DialogContainer />
                <SnackBarProvider />
                <Tabs />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
