import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.5/format/wc/react/index.ts";

import ActivityBanner from "../../components/activities/activity-banner.tsx";

function HomePage() {
  return (
    <>
      <ActivityBanner />
    </>
  );
}

export default toDist(HomePage, import.meta.url);
