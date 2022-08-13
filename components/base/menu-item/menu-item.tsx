import { React, Icon, useStyleSheet } from "../../../deps.ts";
import styleSheet from "./menu-item.scss.js";

// used in the settings page
export default function MenuItem({
  icon,
  children,
  onClick,
}: {
  icon?: string;
  children?: any;
  onClick?: () => void;
}) {
  useStyleSheet(styleSheet);
  return (
    <div className="c-menu-item" onClick={onClick ?? (() => null)}>
      <div className="left">
        <div className="icon">
          <Icon icon={icon} size="20px" />
        </div>
        <div className="title mm-text-subtitle-1">{children}</div>
      </div>
      <div className="right">
        <Icon icon="chevronRight" size="20px" />
      </div>
    </div>
  );
}
