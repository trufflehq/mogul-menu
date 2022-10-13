import { React, useSignal, useStyleSheet } from "../../../deps.ts";
import { CRYSTAL_BALL_ICON, isPollActivityActive, useInterval } from "../../../shared/mod.ts";
import { ActivityListItemProps } from "../activities-tab/activities-tab.tsx";
import { usePageStack } from "../../page-stack/mod.ts";
import PredictionPage from "../../prediction-page/prediction-page.tsx";
import styleSheet from "./prediction-list-item.scss.js";
import ActivityListItem from "../activity-list-item/activity-list-item.tsx";
import { Poll } from "../../../types/mod.ts";
import { PollListItemDescription } from "../poll-list-item/poll-list-item.tsx";

export default function PredictionListItem({ activity }: ActivityListItemProps<Poll>) {
  useStyleSheet(styleSheet);
  const { pushPage } = usePageStack();

  const showPredictionPage = () => {
    pushPage(<PredictionPage pollId={activity.id} />);
  };

  return (
    <ActivityListItem
      className="c-prediction-list-item"
      activityType="Prediction"
      icon={CRYSTAL_BALL_ICON}
      color="#AF7AF2"
      iconViewBox={20}
      title={activity.question}
      onClick={showPredictionPage}
      description={<PollListItemDescription poll={activity} />}
    />
  );
}
