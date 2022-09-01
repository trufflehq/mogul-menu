import { abbreviateNumber, jumper, React, useEffect, useState, useStyleSheet } from "../../deps.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import { useWatchtimeCounter } from "../watchtime/watchtime-counter.ts";
import { MESSAGES, useExtensionAuth } from "../../shared/mod.ts";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClaimable, setIsClaimable] = useState(false);
  const { me, refetchMe } = useExtensionAuth();
  const { channelPointsData, isFetchingChannelPoints, reexecuteChannelPointsQuery } =
    useChannelPoints();

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isFetchingChannelPoints]);

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === MESSAGES.INVALIDATE_USER) {
        refetchMe({ requestPolicy: "network-only" });
      } else if (message === MESSAGES.INVALIDATE_CHANNEL_POINTS) {
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
    jumper.call("comms.postMessage", MESSAGES.INVALIDATE_USER);
    jumper.call("comms.postMessage", MESSAGES.RESET_TIMER);
  };

  const channelPoints = abbreviateNumber(
    channelPointsData?.orgUserCounterType?.orgUserCounter?.count || 0,
    2,
  );

  const onFinishedCountdown = () => {
    setIsClaimable(true);
  };

  const { claim } = useWatchtimeCounter({
    source: "youtube",
    onFinishedCountdown,
    isClaimable,
    setIsClaimable,
  });

  return (
    <div className="c-channel-points">
      <ThemeComponent />
      <div className="inner">
        <div className="coin">
          <ChannelPointsIcon />
        </div>
        {isInitialized && (
          <div className="points">
            {channelPoints}
          </div>
        )}
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
