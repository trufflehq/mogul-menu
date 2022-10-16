import {
  CombinedError,
  Computed,
  Memo,
  ObservableObject,
  React,
  useSelector,
  useStyleSheet,
} from "../../../deps.ts";
import { usePollingActivityAlertConnection$ } from "../signals.ts";
import { hasPermission, isActiveActivity, useOrgUserWithRoles$ } from "../../../shared/mod.ts";
import Button from "../../base/button/button.tsx";
import PollListItem from "../poll-list-item/poll-list-item.tsx";
import RaidListItem from "../raid-list-item/raid-list-item.tsx";
import { useCurrentTab, useTabButton, useTabSlug } from "../../tabs/mod.ts";

import { useDialog } from "../../base/dialog-container/dialog-service.ts";
import CreateActivityDialog from "../create-activity-dialog/create-activity-dialog.tsx";
import styleSheet from "./activities-tab.scss.js";
import { ActivityAlert, OrgUser, StringKeys } from "../../../types/mod.ts";

const ACTIVITY_CONNECTION_INTERVAL = 2000;
const PASSIVE_ACTIVITY_CONNECTION_INTERVAL = 60000;
const ACTIVITY_CONNECTION_LIMIT = 20;

export interface ActivityListItemProps<ActivityType> {
  activity: ActivityType;
  createdBy?: string;
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

  const { isActive } = useCurrentTab();

  const orgUserWithRoles$ = useOrgUserWithRoles$();

  const { pushDialog } = useDialog();
  const activityListItems = props.activityListItems ?? DEFAULT_LIST_ITEMS;

  const { activityAlertConnection$, reexecuteActivityConnectionQuery } =
    usePollingActivityAlertConnection$<ActivityType, SourceType>(
      {
        interval: isActive ? ACTIVITY_CONNECTION_INTERVAL : PASSIVE_ACTIVITY_CONNECTION_INTERVAL,
        limit: ACTIVITY_CONNECTION_LIMIT,
      },
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
          {() => {
            const activityAlerts = useSelector(() =>
              activityAlertConnection$?.alertConnection.nodes.get()?.filter((alert) =>
                alert?.activity && isActiveActivity(alert)
              )
            );

            return (
              <ActivityGroup
                activityAlerts={activityAlerts}
                activityListItems={activityListItems}
                emptyStateMessage="No live activities"
                orgUserWithRoles$={orgUserWithRoles$}
              />
            );
          }}
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
          {() => {
            const activityAlerts = useSelector(() =>
              activityAlertConnection$.alertConnection.nodes.get()?.filter((alert) =>
                alert?.activity && !isActiveActivity(alert)
              )
            );

            return (
              <ActivityGroup
                activityAlerts={activityAlerts}
                activityListItems={activityListItems}
                emptyStateMessage="No past activities"
                orgUserWithRoles$={orgUserWithRoles$}
              />
            );
          }}
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
  { activityAlerts, activityListItems, emptyStateMessage, orgUserWithRoles$ }: {
    activityAlerts: ActivityAlert<ActivityType, SourceType>[];
    activityListItems: ListItemMap<ActivityListItemTypes>;
    emptyStateMessage: string;
    orgUserWithRoles$: ObservableObject<
      { orgUser: OrgUser } & {
        error: CombinedError | undefined;
      }
    >;
  },
) {
  const hasPermissions = useSelector(() =>
    hasPermission({
      orgUser: orgUserWithRoles$.orgUser.get!(),
      actions: ["create", "update", "delete"],
      filters: {
        poll: { isAll: true, rank: 0 },
      },
    })
  );

  return activityAlerts?.length
    ? (
      <div className="list-group">
        {activityAlerts?.map((alert) => {
          const ActivityListItem = alert.sourceType ? activityListItems[alert.sourceType] : null;
          {/* This was necessary to make the TS compiler happy, for some reason it wasn't liking the JSX format <Component activity={activityAlert.activity} />*/}
          return ActivityListItem &&
            React.createElement(ActivityListItem, {
              activity: alert.activity,
              createdBy: hasPermissions ? alert.orgUser?.name : undefined,
            });
        })}
      </div>
    )
    : <div className="empty-list-group">{emptyStateMessage}</div>;
}
