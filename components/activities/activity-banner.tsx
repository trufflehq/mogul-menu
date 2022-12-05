import {
  _,
  classKebab,
  React,
  useComputed,
  useObserve,
  useSelector,
  useSignal,
  useStyleSheet,
} from "../../deps.ts";
import stylesheet from "./activity-banner.scss.js";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import { isActiveActivity, useActivitySubscription$, useLoginListener } from "../../shared/mod.ts";
import { setJumperClosed, setJumperOpen } from "./jumper.ts";
import { isActivityBannerOpen$ } from "./signals.ts";
import { ActivityAlert, Alert, Poll, StringKeys } from "../../types/mod.ts";
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

const ACTIVITY_CONNECTION_LIMIT = 5;

export function ActivityBannerEmbed<
  BannerTypes = BannerMap<{
    poll: Poll;
    alert: Alert<string, any>;
  }>,
>(
  props: ActivityBannerManagerProps<BannerTypes>,
) {
  useStyleSheet(stylesheet);

  const banners = (props.banners ?? DEFAULT_BANNERS) as BannerMap<BannerTypes>;
  props = { ...props, banners };
  useLoginListener();

  return (
    <div className="c-activity-banner-embed">
      <ThemeComponent />
      <ActivityBannerManager {...props} />
    </div>
  );
}

export function ActivityBannerManager<
  BannerTypes,
  SourceType extends StringKeys<BannerTypes>,
  ActivityType extends BannerTypes[SourceType],
>(props: ActivityBannerManagerProps<BannerTypes>) {
  const { activityAlertConnection$ } = useActivitySubscription$<ActivityType, SourceType>({
    status: "ready",
    limit: ACTIVITY_CONNECTION_LIMIT,
  });

  const lastActivityAlert$ = useSignal<ActivityAlert<ActivityType, SourceType> | undefined>(
    undefined!,
  );
  const hasClosed$ = useSignal(false);

  const openBanner = () => {
    isActivityBannerOpen$.set(true);
    setJumperOpen();
  };

  const closeBanner = () => {
    isActivityBannerOpen$.set(false);
    setJumperClosed();
  };

  const hasActivityChanged = useComputed(() =>
    lastActivityAlert$.get()?.id !==
      activityAlertConnection$.data.alertConnection.nodes.get()?.[0]?.id
  );

  useObserve(() => {
    // accessing activityAlert observable so the hook runs when the activity alert observable changes,
    // accessing the selector will not cause the useObserve hook to run
    const activityAlert = activityAlertConnection$.data.alertConnection.nodes.get()?.[0];
    if (activityAlert && hasActivityChanged.get() && isActiveActivity(activityAlert)) {
      openBanner();
      lastActivityAlert$.set(activityAlert);
      hasClosed$.set(false);
    } else if (activityAlert && !isActiveActivity(activityAlert) && !hasClosed$.get()) {
      hasClosed$.set(true);
      closeBanner();
    }
  });

  const activityAlert = useSelector(() =>
    activityAlertConnection$.data.alertConnection.nodes.get()?.[0]
  );

  const isBannerOpen = useSelector(() => isActivityBannerOpen$.get());

  const Component = useSelector(() => {
    const activityAlert = activityAlertConnection$.data.alertConnection.nodes.get()?.[0];
    const activitySourceType = activityAlert?.sourceType;
    return activitySourceType ? props?.banners[activitySourceType] : null;
  });

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
      {activityAlert?.activity &&
        React.createElement(Component, { activity: activityAlert.activity })}
    </div>
  );
}
