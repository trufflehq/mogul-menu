import { React, useSelector, useStyleSheet } from "../../../deps.ts";
import { usePollingActivityAlertConnection$ } from "../signals.ts";
import {
  hasPermission,
  isActiveActivity,
  useOrgUserWithRoles$,
} from "../../../shared/mod.ts";
import Button from "../../base/button/button.tsx";
import PollListItem from "../poll-list-item/poll-list-item.tsx";
import RaidListItem from "../raid-list-item/raid-list-item.tsx";
import { useDialog } from "../../base/dialog-container/dialog-service.ts";
import CreateActivityDialog from "../create-activity-dialog/create-activity-dialog.tsx";
import styleSheet from "./activities-tab.scss.js";
import { StringKeys } from "../../../types/mod.ts";

export interface ActivityListItemProps<ActivityType> {
  activity: ActivityType;
}

type ListItemMap<ActivityTypes> = {
  [K in keyof ActivityTypes]: (props: ActivityListItemProps<ActivityTypes[K]>) => JSX.Element;
};

export const DEFAULT_LIST_ITEMS = {
  poll: PollListItem,
  alert: RaidListItem,
};

export default function ActivitiesTab() {
  return <ActivitiesTabManager activityListItems={DEFAULT_LIST_ITEMS} />;
}

interface ActivitiesTabManagerProps<ActivityTypes> {
  activityListItems: ListItemMap<ActivityTypes>;
}
export function ActivitiesTabManager<
  ActivityListItemTypes,
  SourceType extends StringKeys<ActivityListItemTypes>,
  ActivityType extends ActivityListItemTypes[SourceType],
>(props: ActivitiesTabManagerProps<ActivityListItemTypes>) {
  useStyleSheet(styleSheet);
  const orgUserWithRoles$ = useOrgUserWithRoles$();
  const { pushDialog } = useDialog();
  const activityListItems = props.activityListItems ?? DEFAULT_LIST_ITEMS;

  const activityAlertConnection$ = usePollingActivityAlertConnection$<ActivityType, SourceType>(
    { interval: 2000, limit: 20 },
  );

  const activeActivities = useSelector(() =>
    activityAlertConnection$.data?.get()?.alertConnection.nodes.filter((activity) =>
      activity?.activity
    ).filter(isActiveActivity) || []
  );

  const pastActivities = useSelector(() =>
    activityAlertConnection$?.data?.get()?.alertConnection.nodes
      .filter((activity) => activity?.activity && !isActiveActivity(activity))
  );

  const hasPollPermissions = useSelector(() =>
    hasPermission({
      orgUser: orgUserWithRoles$.orgUser.get!(),
      actions: ["create", "update", "delete"],
      filters: {
        poll: { isAll: true, rank: 0 },
      },
    })
  );

  const onStartActivity = () => {
    pushDialog(<CreateActivityDialog />);
  };
  return (
    <div className="c-activities-tab">
      <div className="list">
        <div className="list-header">
          LIVE ACTIVITIES
        </div>
        {activeActivities?.length
          ? (
            <div className="list-group">
              {activeActivities?.map((activity) => {
                const ActivityListItem = activity.sourceType
                  ? activityListItems[activity.sourceType]
                  : null;

                return ActivityListItem &&
                  React.createElement(ActivityListItem, {
                    activity: activity.activity,
                  });
              })}
            </div>
          )
          : <div className="empty-list-group">No live activities</div>}
        {hasPollPermissions
          ? (
            <Button className="start" style="primary" onClick={onStartActivity}>
              Start an activity
            </Button>
          )
          : null}
      </div>
      <div className="list">
        <div className="list-header">
          ACTIVITY HISTORY
        </div>
        {pastActivities?.length
          ? (
            <div className="list-group">
              {pastActivities?.map((activity) => {
                const ActivityTile = activity.sourceType
                  ? activityListItems[activity.sourceType]
                  : null;
                return ActivityTile &&
                  React.createElement(ActivityTile, { activity: activity.activity });
              })}
            </div>
          )
          : <div className="empty-list-group">No past activities</div>}
      </div>
    </div>
  );
}
