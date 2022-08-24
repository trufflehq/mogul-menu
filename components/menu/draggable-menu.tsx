import { React, classKebab } from "../../deps.ts";
import { useTabs, useMenu, getIsOpen, getMenuPosition, getHasNotification } from '../../state/mod.ts'
import Draggable  from "../draggable/draggable.tsx";

export default function DraggableMenu({ children }: { children: React.ReactNode }) {
  const { state: tabsState } = useTabs();
  const { state: menuState } = useMenu();
  const hasNotification = getHasNotification(tabsState);
  const isOpen = getIsOpen(menuState);
  const menuPosition = getMenuPosition(menuState);
  const className = `c-browser-extension-menu position-${menuPosition} ${
    classKebab(
      { isOpen, hasNotification },
    )
  }`;

  return (
    <Draggable
      requiredClassName="extension-icon"
      ignoreClassName="c-browser-extension-menu"
    >
      <div className={className}>
        <div className="menu">
          {children}
        </div>
      </div>
    </Draggable>
  );
}
