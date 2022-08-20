import {
  _,
  classKebab,
  jumper,
  Obs,
  React,
  useEffect,
  useObservables,
  useRef,
  useState,
  useStyleSheet,
} from "../../deps.ts";
import styleSheet from "./menu.scss.js";
import {
  getHasNotification,
  getMenuState,
  setMenuStyles,
  useTabStateManager,
} from "../../util/mod.ts";
import SnackBarProvider from "../base/snack-bar-provider/snack-bar-provider.tsx";
import Draggable from '../draggable/draggable.tsx'
import Tabs from "../tabs/tabs.tsx";
import TabBar from "../tab-bar/tab-bar.tsx";
import AuthManager from "../auth-manager/auth-manager.tsx";
import ExtensionIcon from '../extension-icon/extension-icon.tsx'
import PageStack from "../page-stack/page-stack.tsx";
import ActionBannerContainer from "../action-banner-container/action-banner-container.tsx";
import DialogContainer from "../base/dialog-container/dialog-container.tsx";


export default function BrowserExtensionMenuBody() {
  useStyleSheet(styleSheet);

  const { extensionInfo } = useObservables(() => ({
    extensionInfo: Obs.from(jumper.call("context.getInfo") || ""),
  }));

  const isClaimable = false;
  const $$extensionIconRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen((prev: boolean) => !prev);

  const { store } = useTabStateManager();
  const hasNotification = getHasNotification(store);

  const className = `z-browser-extension-menu ${
    classKebab(
      { isOpen, hasNotification, isClaimable },
    )
  }`;

  // icon positioning
  // useEffect(() => {
  //   const state = getMenuState({
  //     isOpen,
  //     isClaimable,
  //     shouldShowOnboardTooltip: false,
  //   });
  //   setMenuStyles({ state, jumper, extensionInfo });
  // }, [
  //   isOpen,
  //   isClaimable,
  //   extensionInfo,
  // ]);

  const onExtensionIconClick = () => {
    toggleIsOpen()
    console.log('on icon click')
  }

  const base = { x: 640, y: 600 };
  const defaultModifier = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    transition: "none",
  };
  const dragProps = {
    dimensions: {
      base: base,
      modifiers: defaultModifier,
    },
    defaultPosition: { x: 0, y: 0 },
  };

  // new iFrame styles
  const menuState = getMenuState({
    isOpen,
    isClaimable,
    snackBarQueue: undefined,
    shouldShowOnboardTooltip: false
  });
  switch (menuState) {
    case "closed":
      dragProps.dimensions.modifiers = {
        ...defaultModifier,
        bottom: -560,
        left: -600,
        transition: "clip-path .5s cubic-bezier(.4, .71, .18, .99)",
      };
      break;
    case "closed-with-claim":
      //TODO: add the sizes for the other things once we implement them
      break;
    case "closed-with-snackbar":
      break;
    case "closed-with-tooltip":
      break;
  }

  return (
    <Draggable
    dimensions={dragProps.dimensions}
    defaultPosition={dragProps.defaultPosition}
    requiredClassName="extension-icon"
    ignoreClassName="z-browser-extension-menu"
  >
    <div className={className}>
      <div className="menu">
        <div className="inner">
          <div className="bottom">
            <TabBar />
            <div className="extension-icon-placeholder"></div>
            <ExtensionIcon $$extensionIconRef={$$extensionIconRef}  onClick={onExtensionIconClick} />
          </div>
          <div className="body">
            <AuthManager />
            <DialogContainer />
            <PageStack />
            <ActionBannerContainer />
            <SnackBarProvider />
            <Tabs />
          </div>
        </div>
      </div>
    </div>
    </Draggable>
  );
}
