import {
  _,
  classKebab,
  ImageByAspectRatio,
  React,
  Ripple,
  useLayoutEffect,
  useRef,
  useStyleSheet,
} from "../../deps.ts";
import { getIsOpen, useMenu } from "../../state/mod.ts";
import { TabState, useCurrentTab, useTabButton, useTabs } from "../../state/mod.ts";
import { usePageStack } from "../../util/mod.ts";
import stylesheet from "./tab-bar.scss.js";
export default function TabBar() {
  useStyleSheet(stylesheet);
  const $$additionalButtonRef = useRef<HTMLDivElement>(undefined!);
  const previousTabButtonLengthRef = useRef<number>(0);
  const tabButtonManager = useTabButton();
  const additionalTabButtons = tabButtonManager.buttonMap;
  const { state: tabsState } = useTabs();
  const { state: menuState, setAdditionalButtonRef, updateDimensions } = useMenu();
  const { setActiveTab } = useCurrentTab();
  const { clearPageStack } = usePageStack();
  const isMenuOpen = getIsOpen(menuState);

  const hasTabButtonsLengthChanged =
    previousTabButtonLengthRef.current !== Object.keys(additionalTabButtons)?.length;
  useLayoutEffect(() => {
    updateDimensions();
    if (hasTabButtonsLengthChanged) {
      previousTabButtonLengthRef.current = Object.keys(additionalTabButtons)?.length;
    }
  }, [isMenuOpen, hasTabButtonsLengthChanged]);

  useLayoutEffect(() => {
    setAdditionalButtonRef($$additionalButtonRef);
  }, [$$additionalButtonRef.current]);

  return (
    <div
      className={`c-tab-bar ${
        classKebab({
          isCollapsed: !isMenuOpen,
        })
      }`}
    >
      <div ref={$$additionalButtonRef} className="additional-tab-buttons">
        {Object.values(additionalTabButtons)}
      </div>
      {_.map(Object.entries(tabsState.tabs), ([id, tabState]: [string, TabState]) => {
        const { text: tabText, hasBadge, icon, isActive } = tabState;
        return (
          <div
            key={id}
            className={`tab ${classKebab({ isActive, hasBadge })}`}
            onClick={() => {
              clearPageStack();
              setActiveTab(id);
            }}
          >
            <div className="icon">
              <ImageByAspectRatio
                imageUrl={icon}
                aspectRatio={1}
                width={18}
                height={18}
              />
            </div>
            <div className="title truffle-text-body-2">{tabText}</div>
            <Ripple color="var(--mm-color-text-bg-primary)" />
          </div>
        );
      })}
    </div>
  );
}

export function CollapsibleTabButton(
  { children, collapsedIcon, onClick }: {
    children: React.ReactNode;
    collapsedIcon?: React.ReactNode;
    onClick?: () => void;
  },
) {
  const { state: menuState } = useMenu();
  const isMenuOpen = getIsOpen(menuState);
  return (
    <div
      onClick={onClick}
      className={`c-collapsible-tab-button ${
        classKebab({
          isOpen: isMenuOpen,
          isCollapsed: !isMenuOpen,
        })
      }`}
    >
      {isMenuOpen ? children : collapsedIcon}
    </div>
  );
}
