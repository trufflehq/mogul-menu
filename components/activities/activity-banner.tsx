import { _, classKebab, React, useEffect, useMemo, useRef, useStyleSheet } from "../../deps.ts";
import stylesheet from "./activity-banner.scss.js";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import { CRYSTAL_BALL_ICON, getPollInfo, isActiveActivity } from "../../shared/mod.ts";
import { setJumperClosed, setJumperOpen } from "./jumper.ts";
import { useActivityBanner, useFetchLatestActivityAlert } from "./hooks.ts";
import { ActivityBannerProvider } from "./provider.tsx";
import { ActivityAlert, Poll } from "../../types/mod.ts";
import {
  default as ActivityBannerFragment,
} from "./activity-banner-fragment/activity-banner-fragment.tsx";
import PollBanner from "./poll-banner/poll-banner.tsx";
import AlertBanner from "./alert-banner/alert-banner.tsx";

export interface ActivityBannerProps<ActivityType> {
  activity: ActivityType;
}

export interface ActivityBannerManagerProps<BannerTypes> {
  banners: BannerMap<BannerTypes>;
}

type BannerMap<BannerTypes> = {
  [K in keyof BannerTypes]: (props: ActivityBannerProps<BannerTypes[K]>) => JSX.Element;
};

export const DEFAULT_BANNERS = {
  poll: PollBanner,
  alert: AlertBanner,
  foo: FooBanner,
};

type Foo = {
  bar: unknown;
};

function FooBanner(props: ActivityBannerProps<Foo>) {
  return <div>foo</div>;
}

export default function DefaultActivityBannerEmbed() {
  return <ActivityBannerEmbed banners={DEFAULT_BANNERS} />;
}

export function ActivityBannerEmbed<BannerTypes>(
  props: ActivityBannerManagerProps<BannerTypes>,
) {
  useStyleSheet(stylesheet);

  return (
    <ActivityBannerProvider>
      <ThemeComponent />
      <ActivityBannerManager {...props} />
    </ActivityBannerProvider>
  );
}

type StringKeys<T> = Extract<keyof T, string>;

export function ActivityBannerManager<
  BannerTypes,
  SourceType extends StringKeys<BannerTypes>,
  ActivityType extends BannerTypes[SourceType],
>(props: ActivityBannerManagerProps<BannerTypes>) {
  const activityAlert = useFetchLatestActivityAlert<ActivityType, SourceType>();
  const lastActivityAlertRef = useRef<ActivityAlert<ActivityType, SourceType> | undefined>(
    undefined!,
  );
  const { isBannerOpen, setIsBannerOpen } = useActivityBanner();

  useEffect(() => {
    const hasActivityChanged = lastActivityAlertRef.current?.id !== activityAlert?.id;
    if (hasActivityChanged && isActiveActivity(activityAlert)) {
      setIsBannerOpen(true);
      lastActivityAlertRef.current = activityAlert;
      setJumperOpen();
    } else if (!isActiveActivity(activityAlert)) {
      setIsBannerOpen(false);
      setJumperClosed();
    }
  }, [activityAlert]);

  console.log("activityAlert", activityAlert);

  const Component = useMemo(
    () => {
      const activitySourceType = activityAlert?.sourceType;
      const component = activitySourceType ? props?.banners[activitySourceType] : null;

      return component;
    },
    [activityAlert],
  );

  console.log("activityAlert", activityAlert, Component);

  if (!Component) return null;
  return (
    <div
      className={`c-activity-banner ${
        classKebab({
          isClosed: !isBannerOpen,
        })
      }`}
    >
      <Component activity={activityAlert.activity} />
    </div>
  );
}

function BasePollFragment({ poll }: { poll: Poll }) {
  const { hasPollEnded, pollStartTime, pollEndTime } = getPollInfo(poll);
  return (
    <ActivityBannerFragment
      title={hasPollEnded ? "Poll ended" : "Current poll"}
      startTime={pollStartTime}
      endTime={pollEndTime}
      color={"#CAE88A"}
      icon={{
        path: CRYSTAL_BALL_ICON,
      }}
    >
    </ActivityBannerFragment>
  );
}
