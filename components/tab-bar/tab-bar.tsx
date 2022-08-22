import { _, classKebab, useRef, useEffect, useStyleSheet, ImageByAspectRatio, Ripple, React } from "../../deps.ts";
import {
  TabState,
  usePageStack,
  useTabButton,
  useTabStateManager,
  useTabState,
  useMenu,
  getIsOpen
} from "../../util/mod.ts";
import stylesheet from './tab-bar.scss.js'
export default function TabBar() {
  useStyleSheet(stylesheet)
  const $$additionalButtonRef = useRef(undefined!)
  const previousTabButtonLengthRef = useRef<number>(0)
  const tabButtonManager = useTabButton();
  const additionalTabButtons = tabButtonManager.buttonMap;
  const { store } = useTabStateManager();
  const { store: menuStore, setAdditionalButtonRef, updateDimensions } = useMenu()
  const { setActiveTab } = useTabState()
  const { clearPageStack } = usePageStack();

  useEffect(() => {
    setAdditionalButtonRef($$additionalButtonRef)
  }, [$$additionalButtonRef.current])

  const hasTabButtonsLengthChanged = previousTabButtonLengthRef.current !== Object.keys(additionalTabButtons)?.length
  useEffect(() => {
    updateDimensions()
    previousTabButtonLengthRef.current = Object.keys(additionalTabButtons)?.length
  }, [hasTabButtonsLengthChanged])

  const isMenuOpen = getIsOpen(menuStore)
  // update additional button dimensions
  return (
    <div className={`c-tab-bar ${classKebab({
      isCollapsed: !isMenuOpen
    })}`}>
      <div ref={$$additionalButtonRef} className="additional-tab-buttons">
        {Object.values(additionalTabButtons)}
      </div>
      {_.map(Object.entries(store.tabs), ([id, tabState]: [string, TabState]) => {
        const { text: tabText, hasBadge, icon, isActive } = tabState;
        return (
          <div
            key={id}
            className={`tab ${classKebab({ isActive, hasBadge })}`}
            onClick={() => {
              clearPageStack();
              setActiveTab(id)
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

export function CollapsibleTabButton({ children }: { children?: React.ReactNode }) {
  const { store } = useMenu()
  const isMenuOpen = getIsOpen(store)
  return  <div className={`c-collapsible-tab-button ${classKebab({
    isOpen: isMenuOpen,
    isCollapsed: !isMenuOpen
  })}`}>{
    children
  }</div>
}