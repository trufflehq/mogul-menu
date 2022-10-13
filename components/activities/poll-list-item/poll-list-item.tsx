import { React, useStyleSheet } from "../../../deps.ts";
import { BAR_CHART_ICON_PATH, getPollInfo, isPrediction } from "../../../shared/mod.ts";
import { ActivityListItemProps } from "../activities-tab/activities-tab.tsx";
import styleSheet from "./poll-list-item.scss.js";
import Time from "../../time/time.tsx";
import ActivityListItem from "../activity-list-item/activity-list-item.tsx";
import PredictionListItem from "../prediction-list-item/prediction-list-item.tsx";
import { Poll } from "../../../types/mod.ts";

export default function PollListItem({ activity, isActive }: ActivityListItemProps<Poll>) {
  useStyleSheet(styleSheet);
  if (!activity) return <></>;

  return isPrediction(activity)
    ? <PredictionListItem activity={activity} isActive={isActive} />
    : <BasePollListItem activity={activity} />;
}

function BasePollListItem({ activity }: ActivityListItemProps<Poll>) {
  return (
    <ActivityListItem
      icon={BAR_CHART_ICON_PATH}
      className="c-poll-list-item"
      activityType="Poll"
      color="#CAE88A"
      title={activity.question}
      description={<PollListItemDescription poll={activity} />}
    />
  );
}

export function PollListItemDescription({ poll }: { poll: Poll }) {
  const { hasPollEnded, pollEndTime, isRefund, hasWinningOption } = getPollInfo(poll);
  const pollMsLeft = new Date(pollEndTime || Date.now()).getTime() - Date.now();

  return (
    <div className="c-poll-list-item__description">
      {hasWinningOption
        ? (
          <span className="winner">
            {poll.options[poll.data.winningOptionIndex!].text}
          </span>
        )
        : hasPollEnded
        ? isRefund ? "Prediction canceled" : "Submissions closed"
        : (
          <>
            <Time ms={pollMsLeft} />
            {" left to vote"}
          </>
        )}
    </div>
  );
}
