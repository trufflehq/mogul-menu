import {
  _clearCache,
  abbreviateNumber,
  formatCountdown,
  GLOBAL_JUMPER_MESSAGES,
  jumper,
  React,
  useEffect,
  useObservables,
  useState,
  useStyleSheet,
} from "../../deps.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import { useWatchtimeCounter } from "../watchtime/watchtime-counter.ts";
import { MOGUL_MENU_JUMPER_MESSAGES, useOrgUserConnectionsQuery } from "../../shared/mod.ts";
import { useChannelPoints } from "./hooks.ts";
import ChannelPointsIcon from "../channel-points-icon/channel-points-icon.tsx";
import stylesheet from "./channel-points.scss.js";
import IsLive from "../is-live/is-live.tsx";

const CHANNEL_POINTS_STYLES = {
  width: "140px",
  height: "30px",
  background: "transparent",
  "z-index": "999",
};

export default function ChannelPoints({ highlightButtonBg }: { highlightButtonBg?: string }) {
  useStyleSheet(stylesheet);
  const [isClaimable, setIsClaimable] = useState(false);
  const { refetchOrgUserConnections } = useOrgUserConnectionsQuery();
  const { channelPointsData, reexecuteChannelPointsQuery } = useChannelPoints();

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === GLOBAL_JUMPER_MESSAGES.INVALIDATE_USER) {
        refetchOrgUserConnections({ requestPolicy: "network-only" });
      } else if (message === MOGUL_MENU_JUMPER_MESSAGES.INVALIDATE_CHANNEL_POINTS) {
        reexecuteChannelPointsQuery({ requestPolicy: "network-only" });
      } else if (message === GLOBAL_JUMPER_MESSAGES.ACCESS_TOKEN_UPDATED) {
        // reset the api client w/ the updated user and refetch user/channel points info
        _clearCache();
        refetchOrgUserConnections({ requestPolicy: "network-only" });
        reexecuteChannelPointsQuery({ requestPolicy: "network-only" });
      }
    });

    // set styles for this iframe within YouTube's site
    jumper.call("layout.applyLayoutConfigSteps", {
      layoutConfigSteps: [
        { action: "useSubject" }, // start with our iframe
        { action: "setStyle", value: CHANNEL_POINTS_STYLES },
      ],
    });
  }, []);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClaimable(false);

    await claim();
    jumper.call("comms.postMessage", GLOBAL_JUMPER_MESSAGES.INVALIDATE_USER);
    jumper.call("comms.postMessage", MOGUL_MENU_JUMPER_MESSAGES.RESET_TIMER);
  };

  const channelPoints = abbreviateNumber(
    channelPointsData?.orgUserCounterType?.orgUserCounter?.count || 0,
    2,
  );

  const onFinishedCountdown = () => {
    setIsClaimable(true);
  };

  const { claim, secondsRemainingSubject } = useWatchtimeCounter({
    source: "youtube",
    onFinishedCountdown,
    isClaimable,
    setIsClaimable,
  });

  const { secondsRemaining } = useObservables(() => ({
    secondsRemaining: secondsRemainingSubject.obs,
  }));

  const getCountdownTime = () => {
    return secondsRemaining !== undefined
      ? formatCountdown(secondsRemaining, { shouldAlwaysShowHours: false })
      : "";
  };

  return (
    <div className="c-channel-points" data-title={getCountdownTime()}>
      <ThemeComponent />
      <div className="inner">
        <div className="coin">
          <ChannelPointsIcon />
        </div>
        {
          <div className="points">
            {channelPoints}
          </div>
        }
        <IsLive sourceType="youtubeLive">
          {isClaimable &&
            (
              <div
                className="claim"
                style={{
                  background: highlightButtonBg,
                }}
                onClick={onClick}
              >
                <ChannelPointsIcon size={16} variant="dark" />
              </div>
            )}
        </IsLive>
      </div>
    </div>
  );
}
