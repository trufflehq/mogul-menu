import { jumper, React, useEffect, useStyleSheet } from "../../deps.ts";
import styleSheet from "./menu.scss.js";

import DraggableMenu from "./draggable-menu/draggable-menu.tsx";
import Tabs from "../tabs/tabs.tsx";
import TabBar from "../tab-bar/tab-bar.tsx";
import PageStack from "../page-stack/page-stack.tsx";
import { SnackBarContainer } from "../snackbar/mod.ts";
import { useInvalidateAllQueriesListener } from "../../shared/mod.ts";
import { useOnboarding } from "../onboarding/mod.ts";
import { ActionBannerContainer } from "../action-banner/mod.ts";
import DialogContainer from "../base/dialog-container/dialog-container.tsx";
import { MogulMenuProps } from "./menu.tsx";

function getOrientation(orientationType: OrientationType) {
  switch (orientationType) {
    case "portrait-primary":
    case "portrait-secondary":
      return "portrait";
    case "landscape-primary":
    case "landscape-secondary":
      return "landscape";
  }
}

const LAND_SCAPE_STYLESHEET = `
.truffle-landscape ytm-app {
  padding-top: 0 !important;
}

.truffle-landscape ytm-app ytm-mobile-topbar-renderer {
  display: none;
}

.truffle-landscape #player-thumbnail-overlay {
  display: none;
}

.truffle-landscape ytm-app ytm-watch {
  display: flex !important;
}

.truffle-landscape ytm-app .related-chips-slot-wrapper {
  display: none;
}

.truffle-landscape ytm-app ytm-item-section-renderer {
  border-bottom: none;
}
`;

const PORTRAIT_LAYOUT_CONFIG_STEPS = [
  { action: "querySelector", value: "body" },
  { action: "addClassNames", value: ["truffle-portrait"] },
  { action: "removeClassNames", value: ["truffle-landscape"] },
  {
    action: "setStyleSheet",
    value: {
      id: "landscape-mod-styles",
      css: LAND_SCAPE_STYLESHEET,
    },
  },
  { action: "useDocument", value: null },

  // { action: "querySelector", value: "ytm-app" },
  // { action: "addClassNames", value: ["truffle-portrait"] },
  // { action: "removeClassNames", value: ["truffle-landscape"] },
  // { action: "useDocument", value: null },

  { action: "querySelector", value: "ytm-single-column-watch-next-results-renderer" },
  { action: "setStyle", value: '{"position":"relative"}' },
  { action: "appendSubject", value: null },
  { action: "useDocument", value: null },
  {
    action: "querySelector",
    value: "ytm-single-column-watch-next-results-renderer ytm-item-section-renderer:nth-child(2)",
  },
  { action: "setStyle", value: '{"max-height":"800px", "overflow": "hidden"}' },
  { action: "useDocument", value: null },
  {
    action: "querySelector",
    value: "ytm-single-column-watch-next-results-renderer ytm-item-section-renderer:nth-child(3)",
  },
  { action: "setStyle", value: '{"max-height":"800px", "overflow": "hidden"}' },
];

const LANDSCAPE_LAYOUT_CONFIG_STEPS = [
  // { action: "querySelector", value: "ytm-app" },
  // { action: "setStyle", value: '{"padding-top":"0"}' },
  // { action: "useDocument", value: null },
  // { action: "querySelector", value: "ytm-mobile-topbar-renderer" },
  // { action: "setStyle", value: '{"display":"none"}' },
  // { action: "useDocument", value: null },
  { action: "querySelector", value: "body" },
  { action: "addClassNames", value: ["truffle-landscape"] },
  { action: "removeClassNames", value: ["truffle-portrait"] },
  {
    action: "setStyleSheet",
    value: {
      id: "landscape-mod-styles",
      css: LAND_SCAPE_STYLESHEET,
    },
  },
  { action: "useDocument", value: null },

  // { action: "querySelector", value: "ytm-app" },
  // { action: "addClassNames", value: ["truffle-landscape"] },
  // { action: "removeClassNames", value: ["truffle-portrait"] },
  // { action: "useDocument", value: null },

  // mount the menu
  { action: "querySelector", value: "ytm-single-column-watch-next-results-renderer" },
  { action: "setStyle", value: '{"position":"relative"}' },
  { action: "appendSubject", value: null },
  { action: "useDocument", value: null },
  {
    action: "querySelector",
    value: "ytm-single-column-watch-next-results-renderer ytm-item-section-renderer:nth-child(2)",
  },
  { action: "setStyle", value: '{"max-height":"800px", "overflow": "hidden"}' },
  { action: "useDocument", value: null },
  {
    action: "querySelector",
    value: "ytm-single-column-watch-next-results-renderer ytm-item-section-renderer:nth-child(3)",
  },
  { action: "setStyle", value: '{"max-height":"800px", "overflow": "hidden"}' },
];

export default function BrowserExtensionMenuBody(props: MogulMenuProps) {
  useStyleSheet(styleSheet);
  useInvalidateAllQueriesListener();
  useOnboarding();

  useEffect(() => {
    window.addEventListener("orientationchange", (event) => {
      // jumper.call("platform.log", `orientationchange ${JSON.stringify(event)}`);
      // jumper.call(
      //   "platform.log",
      //   `orientationchange ${JSON.stringify(event?.target?.screen?.orientation?.angle)}`,
      // );
      const orientation = getOrientation(event?.target?.screen?.orientation?.type);
      if (orientation) {
        jumper.call(
          "platform.log",
          `orientationchange ${orientation}`,
        );
        jumper.call("layout.setDefaultLayoutConfigSteps", {
          layoutConfigSteps: orientation === "landscape"
            ? LANDSCAPE_LAYOUT_CONFIG_STEPS
            : PORTRAIT_LAYOUT_CONFIG_STEPS,
        });
      }
      //     browserComms.call('layout.setDefaultLayoutConfigSteps', { layoutConfigSteps })

      // window.ReactNativeWebView.postMessage(
      //   JSON.stringify({
      //     type: "jumper:call:orientationchange",
      //     payload: {
      //       event
      //     },
      //   })
      // );
    });

    return () => window?.removeEventListener("orientationchange");
  }, []);
  return (
    <DraggableMenu {...props}>
      <div className="inner">
        <div className="bottom">
          <TabBar />
          {/* <ExtensionIcon /> */}
        </div>
        <div className="body">
          <DialogContainer />
          <PageStack />
          <ActionBannerContainer />
          <SnackBarContainer />
          <Tabs tabs={props.tabs} />
        </div>
      </div>
    </DraggableMenu>
  );
}
