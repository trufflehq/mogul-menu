import { Memo, Observable, React, useEffect, useSelector, useStyleSheet } from "../../../deps.ts";
import { usePollingActivityAlertConnection$ } from "../signals.ts";
import { hasPermission, isActiveActivity, useOrgUserWithRoles$ } from "../../../shared/mod.ts";
import Button from "../../base/button/button.tsx";
import PollListItem from "../poll-list-item/poll-list-item.tsx";
import RaidListItem from "../raid-list-item/raid-list-item.tsx";
import { useDialog } from "../../base/dialog-container/dialog-service.ts";
import CreateActivityDialog from "../create-activity-dialog/create-activity-dialog.tsx";
import styleSheet from "./activities-tab.scss.js";
import { ActivityConnection, StringKeys } from "../../../types/mod.ts";

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

  const { activityAlertConnection$, reexecuteActivityConnectionQuery } =
    usePollingActivityAlertConnection$<ActivityType, SourceType>(
      { interval: 2000, limit: 20 },
    );

  useEffect(() => {
    reexecuteActivityConnectionQuery();
  }, []);

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
    reexecuteActivityConnectionQuery();
    pushDialog(<CreateActivityDialog />);
  };

  return (
    <div className="c-activities-tab">
      <div className="list">
        <div className="list-header">
          LIVE ACTIVITIES
        </div>
        {/* activity li's will only rerender if their data changes */}
        <Memo>
          {() => (
            <ActivityGroup
              activityConnection$={activityAlertConnection$}
              activityListItems={activityListItems}
              isActive={true}
              emptyStateMessage="No live activities"
            />
          )}
        </Memo>
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
        {/* activity li's will only rerender if their data changes */}
        <Memo>
          {() => (
            <ActivityGroup
              activityConnection$={activityAlertConnection$}
              activityListItems={activityListItems}
              isActive={false}
              emptyStateMessage="No past activities"
            />
          )}
        </Memo>
      </div>
    </div>
  );
}

function ActivityGroup<
  ActivityListItemTypes,
  SourceType extends StringKeys<ActivityListItemTypes>,
  ActivityType extends ActivityListItemTypes[SourceType],
>(
  { activityConnection$, activityListItems, isActive, emptyStateMessage }: {
    activityConnection$: Observable<ActivityConnection<ActivityType, SourceType>>;
    activityListItems: ListItemMap<ActivityListItemTypes>;
    isActive: boolean;
    emptyStateMessage: string;
  },
) {
  const activities = useSelector(() =>
    activityConnection$?.nodes.get()?.filter((activity) =>
      activity?.activity && isActive ? isActiveActivity(activity) : !isActiveActivity(activity)
    )
  );

  return activities?.length
    ? (
      <div className="list-group">
        {activities?.map((activity) => {
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
    : <div className="empty-list-group">{emptyStateMessage}</div>;
}
