import {
  abbreviateNumber,
  getSrcByImageObj,
  gql,
  ImageByAspectRatio,
  useQuery,
  React,
  useObservables,
  useStyleSheet,
  useCallback,
} from "../../deps.ts";
import styleSheet from "./watchtime.scss.js";

import Timer from "../timer/timer.tsx";
import { CollapsibleTabButton } from '../tab-bar/tab-bar.tsx'
import { useWatchtimeCounter } from "../../util/watchtime/watchtime-counter.ts";
import { useTabButton, useMenu } from "../../util/mod.ts";
import ChannelPoints from "../channel-points/channel-points.tsx";
import { useSnackBar } from "../../util/snack-bar/snack-bar.ts";
import SnackBar from "../base/snack-bar/snack-bar.tsx";

const POINTS_QUERY = gql`
  query {
    seasonPass {
      xp: orgUserCounter {
        count
      }
    }

    channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
      orgUserCounter {
        count
      }
    }
  }
`;

const CLAIM_BUTTON = "claim-button";

interface WatchtimeProps {
  highlightButtonBg?: string;
  // creatorName,
  hasChannelPoints: boolean;
  hasBattlePass: boolean;
}

export default function Watchtime(props: WatchtimeProps) {
  useStyleSheet(styleSheet);
  const {
    highlightButtonBg,
    // creatorName,
    hasChannelPoints,
    hasBattlePass,
  } = props;

  const [
    { data: pointsData, fetching: isFetchingPoints },
    reexecutePointsQuery,
  ] = useQuery({
    query: POINTS_QUERY,
  });

  const { setIsClaimable } = useMenu()
  const { addButton, removeButton } = useTabButton();
  const enqueueSnackBar = useSnackBar();

  const creatorName = "Ludwig";

  const claimHandler = async () => {
    setIsClaimable(false)
    removeButton(CLAIM_BUTTON);
    const { channelPointsClaimed, xpClaimed } = (await claim()) ?? {};
    await reexecutePointsQuery({
      requestPolicy: "network-only",
      additionalTypenames: [
        "OrgUserCounter",
        "OwnedCollectible",
        "SeasonPassProgression",
        "ActivePowerup",
        "EconomyTransaction",
      ],
    });

    const { channelPoints, seasonPass } = pointsData ?? {};

    // display a couple of snack bars to notify them of their rewards
    hasChannelPoints &&
      enqueueSnackBar(() => (
        <ChannelPointsClaimSnackBar
          channelPointsClaimed={channelPointsClaimed}
          totalChannelPoints={channelPoints?.orgUserCounter?.count || 0}
        />
      ));
    enqueueSnackBar(() => (
      <XpClaimSnackBar
        xpClaimed={xpClaimed}
        totalXp={parseInt(seasonPass?.xp?.count || 0)}
      />
    ));
  };

  const onFinishedCountdown = useCallback(async () => {
    // console.log('countdown finished')
    await reexecutePointsQuery({
      requestPolicy: "network-only",
      additionalTypenames: [
        "OrgUserCounter",
        "OwnedCollectible",
        "SeasonPassProgression",
        "ActivePowerup",
        "EconomyTransaction",
      ],
    });

    
    // want to update dimensions
    addButton(
      CLAIM_BUTTON,
        <ChannelPoints
          onClick={claimHandler}
          hasText
          hasBattlePass
          hasChannelPoints
          highlightButtonBg="var(--truffle-gradient)"
        />
    );
    
    setIsClaimable(true)
  }, []);

  const { claim, secondsRemainingSubject, timeWatchedSecondsSubject } =
    useWatchtimeCounter({ source: "youtube", onFinishedCountdown });

  const { secondsRemaining, timeWatchedSeconds } = useObservables(() => ({
    timeWatchedSeconds: timeWatchedSecondsSubject.obs,
    secondsRemaining: secondsRemainingSubject.obs,
  }));

  return (
    <div className="c-live-info">
      <div
        className="header"
        style={{
          "--background": highlightButtonBg ?? "var(--truffle-gradient)",
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
          {(hasChannelPoints || hasBattlePass || true) && (
            <Timer timerSeconds={timeWatchedSeconds} message={"Time watched"} />
          )}
          {(hasChannelPoints || hasBattlePass || true) && (
            <Timer
              timerSeconds={secondsRemaining}
              message={"Time until reward"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelPointsClaimSnackBar({
  channelPointsClaimed = 20,
  totalChannelPoints = 0,
  channelPointsImageObj,
  darkChannelPointsImageObj,
}: {
  channelPointsClaimed: number;
  totalChannelPoints: number;
  channelPointsImageObj?: any;
  darkChannelPointsImageObj?: any;
}) {
  // const channelPointsSrc = channelPointsImageObj ? getModel().image.getSrcByImageObj(channelPointsImageObj) : 'https://cdn.bio/assets/images/features/browser_extension/channel-points.svg'
  const darkChannelPointsSrc = channelPointsImageObj
    ? getSrcByImageObj(darkChannelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default-dark.svg";
  return (
    <SnackBar
      {...{
        message: `${channelPointsClaimed} channel points added!`,
        value: (
          <>
            <div>
              {abbreviateNumber(
                parseInt(totalChannelPoints) + parseInt(channelPointsClaimed),
                1
              )}
            </div>
            <ImageByAspectRatio
              imageUrl={darkChannelPointsSrc}
              aspectRatio={1}
              width={16}
              height={16}
            />
          </>
        ),
      }}
    />
  );
}

function XpClaimSnackBar({
  xpClaimed = 1,
  totalXp = 0,
  xpImageObj,
  darkXpImageObj,
}: {
  xpClaimed: number;
  totalXp: number;
  xpImageObj?: any;
  darkXpImageObj?: any;
}) {
  // const xpSrc = xpImageObj ? getModel().image.getSrcByImageObj(xpImageObj) : 'https://cdn.bio/assets/images/features/browser_extension/xp.svg'
  const darkXpSrc = xpImageObj
    ? getSrcByImageObj(darkXpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp-dark.svg";

  return (
    <SnackBar
      {...{
        message: `${xpClaimed} XP earned!`,
        value: (
          <>
            <div>
              {abbreviateNumber(parseInt(totalXp) + parseInt(xpClaimed), 1)}
            </div>
            <ImageByAspectRatio
              imageUrl={darkXpSrc}
              aspectRatio={1}
              width={20}
              height={20}
            />
          </>
        ),
      }}
    />
  );
}
