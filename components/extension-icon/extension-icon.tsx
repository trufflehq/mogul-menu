import { classKebab, getSrcByImageObj, React, Ripple, useStyleSheet } from "../../deps.ts";
import { getHasNotification, useTabs } from "../../state/mod.ts";
import { getMenuIconImageObj, useMenu } from "../../state/mod.ts";
import stylesheet from "./extension-icon.scss.js";

export default function ExtensionIcon({
  $$extensionIconRef,
}: {
  $$extensionIconRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const { state: menuState, toggleOpen } = useMenu();
  const { state: tabsState } = useTabs();
  const hasNotification = getHasNotification(tabsState);

  const onExtensionIconClick = () => {
    toggleOpen();
  };

  useStyleSheet(stylesheet);
  const iconImageObj = getMenuIconImageObj(menuState);
  return (
    <div
      className={`c-extension-icon ${classKebab({ hasNotification })}`}
      style={{
        backgroundImage: iconImageObj ? `url(${getSrcByImageObj(iconImageObj)})` : undefined,
      }}
      ref={$$extensionIconRef}
      onClick={onExtensionIconClick}
    >
      <Ripple color="var(--mm-color-text-bg-primary)" />
    </div>
  );
}
