import { React, useEffect, useStyleSheet } from "../../../deps.ts";
import { Alert } from "../../../types/mod.ts";
import { isRaid } from "../../../shared/mod.ts";
import { ActivityBannerProps } from "../activity-banner.tsx";
import RaidBanner from "./raid-banner.tsx";
import stylesheet from "./alert-banner.scss.js";

const AlertBanner = (
  { activity }: ActivityBannerProps<Alert<any>>,
) => {
  useStyleSheet(stylesheet);
  console.log("rendering alert banner");
  useEffect(() => {
    console.log("alert banner mounted");
  }, []);
  return (
    <>
      {
        isRaid(activity) ? <RaidBanner activity={activity} /> : null // TODO add a base banner for alerts
      }
    </>
  );
};

export default AlertBanner;
