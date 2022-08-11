import {
  React,
  createSubject,
  classKebab,
  Obs,
  op,
  useEffect,
  useMemo,
  useRef,
  useObservables,
  useStyleSheet,
  _,
  gql,
  queryObservable,
  useMutation,
  getSrcByImageObj,
  getModel,
  setCookie,
  getCookie,
} from "../../deps.ts";
import styleSheet from "./channel-points.scss.js";

const ECONOMY_ACTION_QUERY = gql`
  query ($economyTriggerId: ID!) {
    economyAction(input: { economyTriggerId: $economyTriggerId }) {
      id
      orgId
      name
      action
      sourceType
      amountValue
      amountId
      data {
        amountPurchaseIncrementId
        redeemData
        items {
          source {
            id
            name
            type
            fileRel {
              key
              fileId
              fileObj {
                id
                cdn
                data
                prefix
                contentType
                type
                variations
                ext
              }
            }
            data {
              redeemType
              description
              category
              redeemData
            }
          }
          sourceType
          sourceId
          amount
          color
        }
        cooldownSeconds
      }
    }
  }
`;

const WATCH_TIME_INCREMENT_MUTATION = gql`
  mutation ($secondsWatched: Int, $sourceType: String) {
    watchTimeIncrement(
      input: { secondsWatched: $secondsWatched, sourceType: $sourceType }
    ) {
      isUpdated
    }
  }
`;

const WATCH_TIME_CLAIM_MUTATION = gql`
  mutation ($sourceType: String!) {
    watchTimeClaim(input: { sourceType: $sourceType }) {
      economyTransactions {
        amountId
        amountValue
      }
    }
  }
`;

const CHANNEL_POINTS_CLAIM_TRIGGER_ID = "41760be0-6f68-11ec-b706-956d4fcf75c0";
const XP_CLAIM_TRIGGER_ID = "fc93de80-929e-11ec-b349-c56a67a258a0";
const TIMER_INCREMENT_MS = 1000;
const MS_TO_SECONDS = 1000;
const UPDATE_WATCH_TIME_FREQ_SECONDS = 60;
// keep their state if they're gone from stream for < this amount of time
// this is a fix for if they're just refreshing, or if they're going fullscreen (component gets reloaded)
// we could reset more frequently (ie shorter amount of time here), but for now we're
// tying the cookie ttl refresh to the UPDATE_WATCH_TIME_FREQ_SECONDS (probably good to not update cookies too often)
const ALLOWED_TIME_AWAY_MS = 1000 * (UPDATE_WATCH_TIME_FREQ_SECONDS + 10);
const INITIAL_TIME_MS_COOKIE = "extensionInitialTimeMs";
const LAST_CLAIM_TIME_MS_COOKIE = "extensionLastClaimTimeMs";

const DEFAULT_TIMER_SECONDS = 60 * 5;
const DEFAULT_INTERVAL_SECONDS = 1;
function secondsSinceByMilliseconds(minuend, subtrahend) {
  return Math.round((minuend - subtrahend) / MS_TO_SECONDS);
}

function secondsSinceBySeconds(minuend, subtrahend) {
  return Math.round(minuend - subtrahend);
}

// TODO: simplify this by using slug=timer component
// we could probably add something for timer to count up too?
export default function ChannelPointsClaim(props) {
  useStyleSheet(styleSheet);
  const {
    hasText,
    hasChannelPoints,
    hasBattlePass,
    onFinishedCountdown,
    onClaim,
    darkChannelPointsImageObj,
    highlightButtonBg,
    source,
  } = props;
  if (!onFinishedCountdown) {
    console.log("[channel-points]: onFinishedCountdown not defined");
  }
  if (!onClaim) console.log("[channel-points] onClaim not defined");

  const [_incrementWatchtimeResult, executeIncrementWatchtimeMutation] =
    useMutation(WATCH_TIME_INCREMENT_MUTATION);

  const [_watchtimeClaimResult, executeWatchtimeClaimMutation] = useMutation(
    WATCH_TIME_CLAIM_MUTATION
  );

  const intervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);
  const initialTimeRef = useRef(null);
  const decrementStartTimeRef = useRef(null);
  const lootTimerRef = useRef(null);
  const messageTimerRef = useRef(null);

  const {
    watchTimeStream,
    initialTimeStream,
    lastUpdateTimeStream,
    decrementStartTimeStream,
    isClaimButtonVisibleStream,
    claimChannelPointEconomyActionAmountObs,
    claimXpEconomyActionAmountObs,
    claimTimerCountdownSecondsObs,
    claimXpEconomyActionObs,
    claimChannelPointEconomyActionObs,
    timeWatchedSecondsStream,
    secondsRemainingStream,
  } = useMemo(() => {
    const claimChannelPointEconomyActionObs = queryObservable(
      ECONOMY_ACTION_QUERY,
      { economyTriggerId: CHANNEL_POINTS_CLAIM_TRIGGER_ID }
    ).pipe(op.map((result) => result?.data?.economyAction));

    const claimXpEconomyActionObs = queryObservable(ECONOMY_ACTION_QUERY, {
      economyTriggerId: XP_CLAIM_TRIGGER_ID,
    }).pipe(op.map((result) => result?.data?.economyAction));

    const initialTimeMsFromCookie = getCookie(INITIAL_TIME_MS_COOKIE);
    const initialTimeMs = initialTimeMsFromCookie
      ? parseInt(initialTimeMsFromCookie)
      : Date.now();
    const lastClaimTimeMsFromCookie = getCookie(LAST_CLAIM_TIME_MS_COOKIE);
    const decrementTimeMs = lastClaimTimeMsFromCookie
      ? parseInt(lastClaimTimeMsFromCookie)
      : Date.now();

    // set a cookie for when they started watching
    // we'll give them benefit of the doubt where they can stop watching for up to 70 seconds
    // and if they come back it'll resume their timer
    // refresh this cookie for another ALLOWED_TIME_AWAY_MS
    setCookie(INITIAL_TIME_MS_COOKIE, initialTimeMs, {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
    // set initial
    setCookie(LAST_CLAIM_TIME_MS_COOKIE, decrementTimeMs, {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });

    const claimXpEconomyActionAndClaimChannelPointActionObs = Obs.combineLatest(
      claimXpEconomyActionObs,
      claimChannelPointEconomyActionObs
    );

    return {
      timeWatchedSecondsStream: createSubject(),
      secondsRemainingStream: createSubject(),
      watchTimeStream: createSubject(null),
      initialTimeStream: createSubject(initialTimeMs),
      lastUpdateTimeStream: createSubject(Date.now()),
      decrementStartTimeStream: createSubject(decrementTimeMs),
      isClaimButtonVisibleStream: createSubject(false),
      claimChannelPointEconomyActionObs,
      claimChannelPointEconomyActionAmountObs:
        claimChannelPointEconomyActionObs.pipe(
          op.map((economyAction) => economyAction?.amountValue)
        ),
      claimXpEconomyActionObs,
      claimXpEconomyActionAmountObs: claimXpEconomyActionObs.pipe(
        op.map((economyAction) => economyAction?.amountValue)
      ),
      claimTimerCountdownSecondsObs:
        claimXpEconomyActionAndClaimChannelPointActionObs.pipe(
          op.map(([claimXpEconomyAction, claimChannelPointEconomyAction]) => {
            const cooldownSeconds =
              claimChannelPointEconomyAction?.data?.cooldownSeconds ||
              claimXpEconomyAction?.data?.cooldownSeconds;
            if (cooldownSeconds) {
              return Math.max(cooldownSeconds, DEFAULT_INTERVAL_SECONDS);
            } else {
              return DEFAULT_TIMER_SECONDS;
            }
          })
        ),
    };
  }, []);

  const {
    initialTime,
    lastUpdateTime,
    decrementStartTime,
    isClaimButtonVisible,
    claimChannelPointEconomyActionAmount,
    claimXpEconomyActionAmount,
    claimTimerCountdownSeconds,
    claimXpEconomyAction,
    claimChannelPointEconomyAction,
  } = useObservables(() => ({
    initialTime: initialTimeStream.obs,
    lastUpdateTime: lastUpdateTimeStream.obs,
    decrementStartTime: decrementStartTimeStream.obs,
    isClaimButtonVisible: isClaimButtonVisibleStream.obs,
    claimChannelPointEconomyActionAmount:
      claimChannelPointEconomyActionAmountObs,
    claimXpEconomyActionAmount: claimXpEconomyActionAmountObs,
    claimTimerCountdownSeconds: claimTimerCountdownSecondsObs,
    claimXpEconomyAction: claimXpEconomyActionObs,
    claimChannelPointEconomyAction: claimChannelPointEconomyActionObs,
  }));

  const incrementTimer = async () => {
    const updatedTime = Date.now();

    const secondsElapsedSinceLastUpdate = secondsSinceByMilliseconds(
      updatedTime,
      lastUpdateTimeRef.current
    );

    const secondsSinceInitialLoad = secondsSinceByMilliseconds(
      updatedTime,
      initialTimeRef.current
    );
    timeWatchedSecondsStream.next(secondsSinceInitialLoad);

    // update the server every 60s to keep track of watch time progress
    const shouldUpdateWatchTime =
      secondsElapsedSinceLastUpdate >= UPDATE_WATCH_TIME_FREQ_SECONDS;

    if (shouldUpdateWatchTime) {
      // refresh this cookie for another ALLOWED_TIME_AWAY_MS
      setCookie(INITIAL_TIME_MS_COOKIE, initialTimeRef.current, {
        ttlMs: ALLOWED_TIME_AWAY_MS,
      });
      // refresh last claim time cookie
      setCookie(
        LAST_CLAIM_TIME_MS_COOKIE,
        getCookie(LAST_CLAIM_TIME_MS_COOKIE),
        { ttlMs: ALLOWED_TIME_AWAY_MS }
      );
      lastUpdateTimeStream.next(Date.now());
      const secondsWatched = secondsElapsedSinceLastUpdate;

      if (source?.sourceType) {
        await executeIncrementWatchtimeMutation({
          secondsWatched,
          sourceType: source.sourceType,
        });
      }
    }

    watchTimeStream.next(updatedTime);
  };

  const decrementTimer = () => {
    const currentTime = Date.now();

    const secondsSinceDecrementStart = secondsSinceByMilliseconds(
      currentTime,
      decrementStartTimeRef.current
    );

    const secondsRemaining = secondsSinceBySeconds(
      claimTimerCountdownSeconds,
      secondsSinceDecrementStart
    );

    secondsRemainingStream.next(secondsRemaining);

    if (secondsRemaining <= 0) {
      isClaimButtonVisibleStream.next(true);
      onFinishedCountdown();
    }
  };

  const onClaimHandler = async () => {
    setCookie(LAST_CLAIM_TIME_MS_COOKIE, Date.now(), {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
    decrementStartTimeStream.next(Date.now());
    isClaimButtonVisibleStream.next(false);

    clearTimeout(messageTimerRef.current);

    if (source?.sourceType) {
      const economyTransactions = await executeWatchtimeClaimMutation({
        sourceType: source.sourceType,
      });

      const channelPointsClaimed =
        _.find(economyTransactions, {
          amountId: claimChannelPointEconomyAction?.amountId,
        })?.amountValue || claimChannelPointEconomyActionAmount;
      const xpClaimed =
        _.find(economyTransactions, {
          amountId: claimXpEconomyAction?.amountId,
        })?.amountValue || claimXpEconomyActionAmount;

      onClaim({
        channelPointsClaimed,
        xpClaimed,
      });
    }
  };

  lastUpdateTimeRef.current = lastUpdateTime;
  decrementStartTimeRef.current = decrementStartTime;
  initialTimeRef.current = initialTime;

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(incrementTimer, TIMER_INCREMENT_MS);

    if (!getCookie("hasReceivedInitial")) {
      setCookie("hasReceivedInitial", "1");
      isClaimButtonVisibleStream.next(true);
    }

    if (!getCookie("hasReceivedInitialExtra")) {
      setCookie("hasReceivedInitialExtra", "1");
      // this causes invalidation / refetching of all data, so leaving out for now
      // could optimize to have it only invalidate orgUserCounters
    }

    clearInterval(lootTimerRef.current);
    lootTimerRef.current = setInterval(decrementTimer, TIMER_INCREMENT_MS);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(lootTimerRef.current);
    };
  }, [claimTimerCountdownSeconds]);

  // const channelPointsSrc = model.image.getSrcByImageObj(channelPointsImageObj) ?? 'https://cdn.bio/assets/images/features/chrome_extension/channel-points-default.svg'
  const darkChannelPointsSrc =
    (darkChannelPointsImageObj &&
      getSrcByImageObj(darkChannelPointsImageObj)) ||
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default-dark.svg";
  const fullTitle =
    hasChannelPoints && hasBattlePass
      ? "Claim points & XP"
      : hasChannelPoints
      ? "Claim points"
      : hasBattlePass
      ? "Claim XP"
      : "Claim";

  const shortTitle = hasChannelPoints
    ? "Claim points"
    : hasBattlePass
    ? "Claim XP"
    : "Claim";

  return (
    <div className="c-channel-points" title={fullTitle}>
      {
        <div
          className={`claim ${classKebab({
            hasText,
            isVisible: isClaimButtonVisible,
          })}`}
          style={{
            background: highlightButtonBg,
            // backgroundColor: cssVars.$tertiaryBase,
          }}
          onClick={onClaimHandler}
        >
          <div className="icon">
            <img src={darkChannelPointsSrc} width="16" />
          </div>
          {hasText && <div className="title">{shortTitle}</div>}
        </div>
      }
    </div>
  );
}
