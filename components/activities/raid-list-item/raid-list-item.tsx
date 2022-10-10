import { React, useStyleSheet } from "../../../deps.ts";
import {
  PARACHUTE_ICON_PATH,
} from "../../../shared/mod.ts";
import { ActivityListItemProps } from "../activities-tab/activities-tab.tsx";
import ActivityListItem from "../activity-list-item/activity-list-item.tsx";
import stylesheet from './raid-list-item.scss.js'
import { RaidAlert } from "../../../types/mod.ts";

export default function RaidListItem({ activity }: ActivityListItemProps<RaidAlert>) {
  useStyleSheet(stylesheet);
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(activity.data.url, "_blank");
  };

  return (
    <ActivityListItem
      activityType="Raid"
      icon={PARACHUTE_ICON_PATH}
      iconViewBox={24}
      color="#F86969"
      title={activity.data.title}
      description={activity.data.description}
      onClick={onClick}
    />
  );
}
