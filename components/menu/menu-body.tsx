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
  useEffect(() => {
    const state = getMenuState({
      isOpen,
      isClaimable,
      shouldShowOnboardTooltip: false,
    });
    setMenuStyles({ state, jumper, extensionInfo });
  }, [
    isOpen,
    isClaimable,
    extensionInfo,
  ]);

  const onExtensionIconClick = () => {
    toggleIsOpen()
  }
  return (
    <div className={className}>
      <ExtensionIcon $$extensionIconRef={$$extensionIconRef}  onClick={onExtensionIconClick} />
      <div className="menu">
        <div className="inner">
          <div className="bottom">
            <TabBar />
            <div className="extension-icon-placeholder"></div>
          </div>
          <div className="body">
            <AuthManager />
            <DialogContainer />
            <PageStack />
            <ActionBannerContainer />
            <Tabs />
          </div>
        </div>
      </div>
    </div>
  );
}
