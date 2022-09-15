import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.5/format/wc/react/index.ts";

import { ActivityBannerEmbed } from "../../components/activities/activity-banner.tsx";
import { PollBanner } from "../../components/activities/poll-banner/mod.ts";
function HomePage() {
  const banners = {
    poll: PollBanner,
  };
  return (
    <>
      <ActivityBannerEmbed banners={banners} />
    </>
  );
}

export default toDist(HomePage, import.meta.url);
