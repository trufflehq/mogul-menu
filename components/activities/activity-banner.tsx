import { _, classKebab, React, useEffect, useMemo, useRef, useStyleSheet } from "../../deps.ts";
import stylesheet from "./activity-banner.scss.js";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import { isActiveActivity } from "../../shared/mod.ts";
import { setJumperClosed, setJumperOpen } from "./jumper.ts";
import { useActivityBanner, useFetchLatestActivityAlert } from "./hooks.ts";
import { ActivityBannerProvider } from "./provider.tsx";
import { ActivityAlert, Poll } from "../../types/mod.ts";
import PollBanner from "./poll-banner/poll-banner.tsx";
import AlertBanner from "./alert-banner/alert-banner.tsx";

export interface ActivityBannerProps<ActivityType> {
  activity: ActivityType;
}

type BannerMap<BannerTypes> = {
  [K in keyof BannerTypes]: (props: ActivityBannerProps<BannerTypes[K]>) => JSX.Element;
};

export interface ActivityBannerManagerProps<BannerTypes> {
  banners: BannerMap<BannerTypes>;
}

export const DEFAULT_BANNERS = {
  poll: PollBanner,
  alert: AlertBanner,
};

export function ActivityBannerEmbed<
  BannerTypes = BannerMap<{
    poll: Poll;
    alert: ActivityAlert<unknown, string>;
  }>,
>(
  props: ActivityBannerManagerProps<BannerTypes>,
) {
  useStyleSheet(stylesheet);
  props = { ...props, banners: props.banners ?? DEFAULT_BANNERS };
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

  const openBanner = () => {
    setIsBannerOpen(true);
    setJumperOpen();
  };

  const closeBanner = () => {
    setIsBannerOpen(false);
    setJumperClosed();
  };

  useEffect(() => {
    const hasActivityChanged = lastActivityAlertRef.current?.id !== activityAlert?.id;
    // if there's a new activity and the activity is active, open the banner
    if (hasActivityChanged && isActiveActivity(activityAlert)) {
      openBanner();
      lastActivityAlertRef.current = activityAlert;

      // if the activity isn't active, close the banner
    } else if (!isActiveActivity(activityAlert)) {
      closeBanner();
    }
  }, [activityAlert]);

  // only grab the component when activityAlert changes
  const Component = useMemo(
    () => {
      const activitySourceType = activityAlert?.sourceType;
      const component = activitySourceType ? props?.banners[activitySourceType] : null;

      return component;
    },
    [activityAlert],
  );

  if (!Component) return null;

  return (
    <div
      className={`c-activity-banner ${
        classKebab({
          isClosed: !isBannerOpen,
        })
      }`}
    >
      {/* This was necessary to make the TS compiler happy, for some reason it wasn't liking the JSX format <Component activity={activityAlert.activity} />*/}
      {React.createElement(Component, { activity: activityAlert.activity })}
    </div>
  );
}
