import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.5/format/wc/react/index.ts";

import { ActivityBannerEmbed } from "../../components/activities/activity-banner.tsx";
import { PollBanner } from "../../components/activities/poll-banner/mod.ts";
import AlertBanner from "../../components/activities/alert-banner/alert-banner.tsx";
function HomePage() {
  const banners = {
    poll: PollBanner,
    alert: AlertBanner,
  };
  return (
    <>
      <ActivityBannerEmbed banners={banners} />
    </>
  );
}

export default toDist(HomePage, import.meta.url);
