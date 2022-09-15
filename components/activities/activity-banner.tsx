import {
  _,
  classKebab,
  jumper,
  React,
  useEffect,
  useMemo,
  useRef,
  useStyleSheet,
} from "../../deps.ts";
import stylesheet from "./activity-banner.scss.js";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import { CRYSTAL_BALL_ICON, getPollInfo, isActiveActivity } from "../../shared/mod.ts";
import { getIframeStyles } from "./jumper.ts";
import { useActivityBanner, useFetchLatestActivityAlert } from "./hooks.ts";
import { ActivityBannerProvider } from "./provider.tsx";
import { ActivityAlert, Alert, Poll } from "../../types/mod.ts";
import {
  default as ActivityBannerFragment,
} from "./activity-banner-fragment/activity-banner-fragment.tsx";
import PollBanner from "./poll-banner/poll-banner.tsx";
import AlertBanner from "./alert-banner/alert-banner.tsx";

export interface ActivityBannerProps<T> {
  activity: T;
}

type ActivitySourceType = "poll" | "alert" | string;
export interface ActivityBannerManagerProps<T> {
  banners: Record<ActivitySourceType, (props: ActivityBannerProps<T>) => JSX.Element>;
}

type BannerMap<Banners> = {
  [K in keyof Banners]: (props: ActivityBannerProps<Banners[K]>) => JSX.Element;
};

export const DEFAULT_BANNERS: Record<
  ActivitySourceType,
  (props: ActivityBannerProps<any>) => JSX.Element
> = {
  poll: PollBanner,
  alert: AlertBanner,
};

// export const DEFAULT_BANNERS: BannerMap<{
//   poll: Poll;
//   alert: Alert;
// }> = {
//   poll: PollBanner,
//   alert: AlertBanner,
// };

export default function DefaultActivityBannerEmbed() {
  return <ActivityBannerEmbed banners={DEFAULT_BANNERS} />;
}

export function ActivityBannerEmbed<T>(
  props: ActivityBannerManagerProps<T>,
) {
  useStyleSheet(stylesheet);

  return (
    <ActivityBannerProvider>
      <ThemeComponent />
      <ActivityBannerManager {...props} />
    </ActivityBannerProvider>
  );
}

function setJumperOpen() {
  const styles = getIframeStyles(
    "open",
  );
  jumper.call("layout.applyLayoutConfigSteps", {
    layoutConfigSteps: [
      { action: "useSubject" }, // start with our iframe
      { action: "setStyle", value: styles },
    ],
  });
}

function setJumperClosed() {
  const styles = getIframeStyles("closed");
  jumper.call("layout.applyLayoutConfigSteps", {
    layoutConfigSteps: [
      { action: "useSubject" }, // start with our iframe
      { action: "setStyle", value: styles },
    ],
  });
}

export function ActivityBannerManager<T>(props: ActivityBannerManagerProps<T>) {
  const activityAlert = useFetchLatestActivityAlert<T>();
  const lastActivityAlertRef = useRef<ActivityAlert<T> | undefined>(undefined!);
  const { isBannerOpen, setIsBannerOpen } = useActivityBanner();

  useEffect(() => {
    const hasActivityChanged = lastActivityAlertRef.current?.id !== activityAlert?.id;
    if (hasActivityChanged && isActiveActivity(activityAlert)) {
      setIsBannerOpen(true);
      lastActivityAlertRef.current = activityAlert;
      setJumperOpen();
      console.log("activity changed");
    } else if (!isActiveActivity(activityAlert)) {
      setIsBannerOpen(false);
      setJumperClosed();
      console.log("activity closed");
    }
  }, [activityAlert]);

  console.log("activityAlert", activityAlert);

  const Component = useMemo(
    () => {
      const activityType = activityAlert?.sourceType;
      return activityType ? props?.banners[activityType] : null;
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
