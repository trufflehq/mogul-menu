import { formatCountdown, gql, React, useSelector, useStyleSheet } from "../../deps.ts";
import styleSheet from "./watchtime.scss.js";
import { getCreatorName, useMenu } from "../menu/mod.ts";
import Button from "../../components/base/button/button.tsx";
import useWatchtimeClaimCounter from "./watchtime-claim-counter.tsx";
import useWatchtimePassiveCounter from "./watchtime-passive-counter.tsx";
import Timer from "./timer.tsx";

// const POINTS_QUERY = gql`
//   query {
//     seasonPass {
//       xp: orgUserCounter {
//         count
//       }
//     }

//     channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
//       orgUserCounter {
//         count
//       }
//     }
//   }
// `;

interface WatchtimeProps {
  highlightButtonBg?: string;
  hasChannelPoints: boolean;
  hasBattlePass: boolean;
}

export default function Watchtime(props: WatchtimeProps) {
  useStyleSheet(styleSheet);
  const { state: menuState } = useMenu();
  const creatorName = getCreatorName(menuState);
  const {
    highlightButtonBg,
    hasChannelPoints,
    hasBattlePass,
  } = props;

  const { claim, claimCountdownMs$, canClaim$ } = useWatchtimeClaimCounter({
    sourceType: "youtube",
  });
  const { timeWatchedMs$ } = useWatchtimePassiveCounter({ sourceType: "youtube" });

  const canClaim = useSelector(() => canClaim$.get());

  return (
    <div className="c-live-info">
      <div
        className="header"
        style={{
          "--background": highlightButtonBg ?? "var(--mm-gradient)",
        }}
      >
        {creatorName ? `${creatorName} is live!` : ""}
      </div>
      <div className="info">
        <div className="message">
          {creatorName
            ? hasChannelPoints && hasBattlePass
              ? `Earn channel points and XP by watching ${creatorName} during the stream`
              : hasChannelPoints
              ? `Earn channel points by watching ${creatorName} during the stream`
              : hasBattlePass
              ? `Earn XP by watching ${creatorName} during the stream`
              : "Channel Points and XP not currently enabled"
            : "Channel Points and XP not currently enabled"}
        </div>
        <div className="grid">
          <Timer timerMs$={timeWatchedMs$} message={"Time watched"} />
          <Button isDisabled={!canClaim} className="claim" style="gradient" onClick={onClaim}>
            {canClaim
              ? "Claim Reward"
              : <Timer
                timerMs$={claimCountdownMs$}
                Component={WatchtimeClaimCounterDisplayTimer}
              />}
          </Button>
          <WatchtimeClaimCounter Component={WatchtimeClaimCounterDisplay} />
        </div>
      </div>
    </div>
  );
}

function WatchtimeClaimCounterDisplay({ canClaim$, claimCountdownMs$, onClaim }) {
  const canClaim = useSelector(() => canClaim$.get());
  return (
    <Button isDisabled={!canClaim} className="claim" style="gradient" onClick={onClaim}>
      {canClaim
        ? "Claim Reward"
        : <Timer timerMs$={claimCountdownMs$} Component={WatchtimeClaimCounterDisplayTimer} />}
    </Button>
  );
}

function WatchtimeClaimCounterDisplayTimer({ timerMs }) {
  return (
    <>
      <div className="title">
        Claim reward in
        {formatCountdown(timerMs / 1000, { shouldAlwaysShowHours: false })}
      </div>
    </>
  );
}
function WatchtimePassiveCounterDisplayTimer({ timerMs }) {
  return (
    <>
      <div className="title">
        Time watched
        {formatCountdown(timerMs / 1000, { shouldAlwaysShowHours: false })}
      </div>
    </>
  );
}
