import { _, classKebab, ImageByAspectRatio, Ripple, React } from "../../deps.ts";
import {
  TabState,
  usePageStack,
  useTabButton,
  useTabStateManager,
  useTabState
} from "../../util/mod.ts";

export default function TabBar() {
  const tabButtonManager = useTabButton();
  const additionalTabButtons = tabButtonManager.buttonMap;
  const { store } = useTabStateManager();
  const { setActiveTab } = useTabState()
  const { clearPageStack } = usePageStack();

  return (
    <div className="tabs">
      <div className="additional-tab-buttons">
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