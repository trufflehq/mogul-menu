import { React, useStyleSheet } from "../../../deps.ts";
import ListItem from "../../list-item/list-item.tsx";
import stylesheet from "./activity-list-item.scss.js";

export default function ActivityListItem(
  { icon, color, className, activityType, title, description, iconViewBox, onClick }: {
    icon: string;
    color: string;
    className?: string;
    activityType: React.ReactNode;
    title: React.ReactNode;
    description: React.ReactNode;
    iconViewBox?: number;
    onClick?: (e: React.MouseEvent) => void;
  },
) {
  useStyleSheet(stylesheet);
  return (
    <ListItem
      className={`c-activity-list-item ${className}`}
      icon={icon}
      iconViewBox={iconViewBox}
      color={color}
      onClick={onClick}
    >
      <div className="header">
        <span
          className="type"
          style={{
            color,
          }}
        >
          {activityType}
        </span>
        {/* TODO — created by for mods */}
      </div>
      <div className="title">
        {title}
      </div>
      <div className="description">
        {description}
      </div>
    </ListItem>
  );
}
