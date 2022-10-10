import { React, useSelector, useStyleSheet } from "../../../deps.ts";
import { usePollingActivityAlertConnection$ } from "../signals.ts";
import { isActiveActivity, isPrediction } from "../../../shared/mod.ts";

import PollListItem from "../poll-list-item/poll-list-item.tsx";
import RaidListItem from "../raid-list-item/raid-list-item.tsx";
import styleSheet from "./activities-tab.scss.js";
import { StringKeys } from "../../../types/mod.ts";

export interface ActivityListItemProps<ActivityType> {
  activity: ActivityType;
  isActive?: boolean;
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
  const activityListItems = props.activityListItems ?? DEFAULT_LIST_ITEMS;

  const activityAlertConnection$ = usePollingActivityAlertConnection$<ActivityType, SourceType>(
    2000,
    20,
  );

  const activeActivities = useSelector(() =>
    activityAlertConnection$.data?.get()?.alertConnection?.nodes?.filter((activity) =>
      activity?.activity
    ).filter(isActiveActivity)
  );

  // HACK - this is a hack to only open the active prediction
  // remove once we've cleaned up the prediction component so we can 
  // render past prediction results
  const firstPrediction = activeActivities?.find((activity) => isPrediction(activity.activity));

  const pastActivities = useSelector(() =>
    activityAlertConnection$?.data?.get()?.alertConnection?.nodes?.filter((activity) =>
      activity?.activity
    ).filter((
      activity,
    ) => !isActiveActivity(activity))
  );

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
                const ActivityTile = activity.sourceType
                  ? activityListItems[activity.sourceType]
                  : null;

                // HACK - this is a hack to only open the active prediction
                // remove once we've cleaned up the prediction component so we can 
                // render past prediction results
                const isActivePrediction = isPrediction(activity.activity) &&
                  firstPrediction?.id === activity.id;
                return ActivityTile &&
                  React.createElement(ActivityTile, {
                    activity: activity.activity,
                    isActive: isActivePrediction,
                  });
              })}
            </div>
          )
          : <div className="empty-list-group">No live activities</div>}
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
