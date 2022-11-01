import { jumper, React, useEffect, useStyleSheet } from "../../deps.ts";
import styleSheet from "./menu.scss.js";

import DraggableMenu from "./draggable-menu/draggable-menu.tsx";
import NativeMenu from "./native-menu/native-menu.tsx";
import Tabs from "../tabs/tabs.tsx";
import TabBar from "../tab-bar/tab-bar.tsx";
import PageStack from "../page-stack/page-stack.tsx";
import { SnackBarContainer } from "../snackbar/mod.ts";
import { useInvalidateAllQueriesListener } from "../../shared/mod.ts";
import { useOnboarding } from "../onboarding/mod.ts";
import { ActionBannerContainer } from "../action-banner/mod.ts";
import DialogContainer from "../base/dialog-container/dialog-container.tsx";
import { MogulMenuProps } from "./menu.tsx";

export default function BrowserExtensionMenuBody(props: MogulMenuProps) {
  useStyleSheet(styleSheet);
  useInvalidateAllQueriesListener();
  useOnboarding();

  return <NativeMenu {...props} />;
}

function WebMenu(props: MogulMenuProps) {
  <DraggableMenu {...props}>
    <div className="inner">
      <div className="bottom">
        <TabBar />
      </div>
      <div className="body">
        <DialogContainer />
        <PageStack />
        <ActionBannerContainer />
        <SnackBarContainer />
        <Tabs tabs={props.tabs} />
      </div>
    </div>
  </DraggableMenu>;
}
