import {
  React,
  useStyleSheet,
  Ripple,
  getSrcByImageObj,
  classKebab,
} from "../../deps.ts";
import {
  useMenu,
  getMenuIconImageObj,
  getHasNotification,
  useTabStateManager,
} from "../../util/mod.ts";
import stylesheet from "./extension-icon.scss.js";

export default function ExtensionIcon({
  $$extensionIconRef,
}: {
  $$extensionIconRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const { store, toggleOpen } = useMenu();
  const { store: tabStateStore } = useTabStateManager();
  const hasNotification = getHasNotification(tabStateStore);

  const onExtensionIconClick = () => {
    toggleOpen();
  };

  useStyleSheet(stylesheet);
  const iconImageObj = getMenuIconImageObj(store);
  return (
    <div
      className={`c-extension-icon ${classKebab({ hasNotification })}`}
      style={{
        backgroundImage: iconImageObj
          ? `url(${getSrcByImageObj(iconImageObj)})`
          : undefined,
      }}
      ref={$$extensionIconRef}
      onClick={onExtensionIconClick}
    >
      <Ripple color="var(--mm-color-text-bg-primary)" />
    </div>
  );
}
