import { React, useEffect, useStyleSheet } from "../../../deps.ts";
import { Poll } from "../../../types/mod.ts";
import { isPrediction } from "../../../shared/mod.ts";
import { ActivityBannerProps } from "../activity-banner.tsx";
import PredictionFragment from "./prediction-banner.tsx";

import stylesheet from "./poll-banner.scss.js";

const PollBanner = (
  { activity }: ActivityBannerProps<Poll>,
) => {
  useStyleSheet(stylesheet);
  console.log("rendering poll banner");
  useEffect(() => {
    console.log("poll banner mounted");
  }, []);
  return (
    <>
      {
        isPrediction(activity) ? <PredictionFragment poll={activity} /> : null // TODO add when we add polls <BasePollFragment poll={poll} />
      }
    </>
  );
};

export default PollBanner;
