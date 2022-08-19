import { _, classKebab, ImageByAspectRatio, Ripple, React } from "../../deps.ts";
import {
  setActiveTab,
  TabState,
  usePageStack,
  useTabButtonManager,
  useTabStateManager,
} from "../../util/mod.ts";

export default function TabBar() {
  const tabButtonManager = useTabButtonManager();
  const additionalTabButtons = tabButtonManager.buttonMap;
  const tabStateManager = useTabStateManager();
  const { clearPageStack } = usePageStack();
  const { store, dispatch } = tabStateManager;

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
              dispatch(setActiveTab(id));
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