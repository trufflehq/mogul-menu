import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.5/format/wc/react/index.ts";

import {
  ActivityBannerEmbed,
  ActivityBannerProps,
  PollBanner,
  AlertBanner
} from "../../components/activities/mod.ts";

type Foo = {
  bar: string;
};

function FooBanner(props: ActivityBannerProps<Foo>) {
  return <div>{props.activity.bar}</div>;
}

function HomePage() {
  const banners = {
    poll: PollBanner,
    alert: AlertBanner,
    foo: FooBanner,
  };
  return (
    <>
      <ActivityBannerEmbed banners={banners} />
    </>
  );
}

export default toDist(HomePage, import.meta.url);
