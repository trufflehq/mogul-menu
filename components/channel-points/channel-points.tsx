import React, { useContext, useEffect, useMemo, useRef } from "react";

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

// HACK: for faze
const isFaze = typeof window !== "undefined" &&
  window.location?.hostname === "faze1.live";

// TODO: simplify this by using slug=timer component
// we could probably add something for timer to count up too?
export default function $channelPoints(props) {
  const {
    hasText,
    hasChannelPoints,
    hasBattlePass,
    onFinishedCountdown,
    onClaim,
    darkChannelPointsImageObj,
    highlightButtonBg,
    source,
    timeWatchedSecondsStream,
    secondsRemainingStream,
  } = props;
  if (!onFinishedCountdown) {
    console.log("[channel-points]: onFinishedCountdown not defined");
  }
  if (!onClaim) console.log("[channel-points] onClaim not defined");

  const { cookie, model, cssVars } = useContext(context);

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
  } = useMemo(() => {
    const claimChannelPointEconomyActionObs = model.economyAction
      .getByEconomyTriggerId(CHANNEL_POINTS_CLAIM_TRIGGER_ID);
    const claimXpEconomyActionObs = model.economyAction.getByEconomyTriggerId(
      XP_CLAIM_TRIGGER_ID,
    );

    let fazeWatchTimeObs;
    // HACK for faze
    if (isFaze) {
      // watch time
      const fazeWatchTimeId = "fdc325f0-d7da-11ec-a45e-fb5dc1a0e92a";
      // const fazeWatchTimeId = '5af015c0-baea-11ec-aa58-d2e2b8fae502' // staging
      fazeWatchTimeObs = model.orgUserCounter.getMeByCounterTypeId(
        fazeWatchTimeId,
      )
        .pipe(
          Stream.op.take(1),
          Stream.op.map((orgUserCounter) => {
            // HACK to keep same start time through cache invalidations
            if (window._fStartTime) {
              return window._fStartTime;
            }
            const secondsWatched = orgUserCounter?.count || 0;
            window._fStartTime = new Date(Date.now() - 1000 * secondsWatched)
              .getTime();
            return new Date(Date.now() - 1000 * secondsWatched).getTime();
          }),
        );
    }
    const initialTimeMsFromCookie = cookie.get(INITIAL_TIME_MS_COOKIE);
    const initialTimeMs = initialTimeMsFromCookie
      ? parseInt(initialTimeMsFromCookie)
      : Date.now();
    const lastClaimTimeMsFromCookie = cookie.get(LAST_CLAIM_TIME_MS_COOKIE);
    const decrementTimeMs = lastClaimTimeMsFromCookie
      ? parseInt(lastClaimTimeMsFromCookie)
      : Date.now();

    // set a cookie for when they started watching
    // we'll give them benefit of the doubt where they can stop watching for up to 70 seconds
    // and if they come back it'll resume their timer
    // refresh this cookie for another ALLOWED_TIME_AWAY_MS
    cookie.set(INITIAL_TIME_MS_COOKIE, initialTimeMs, {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
    // set initial
    cookie.set(LAST_CLAIM_TIME_MS_COOKIE, decrementTimeMs, {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });

    const claimXpEconomyActionAndClaimChannelPointActionObs = Stream.Obs
      .combineLatest(
        claimXpEconomyActionObs,
        claimChannelPointEconomyActionObs,
      );

    return {
      watchTimeStream: Stream.createStream(null),
      initialTimeStream: Stream.createStream(fazeWatchTimeObs || initialTimeMs),
      lastUpdateTimeStream: Stream.createStream(Date.now()),
      decrementStartTimeStream: Stream.createStream(decrementTimeMs),
      isClaimButtonVisibleStream: Stream.createStream(false),
      claimChannelPointEconomyActionObs,
      claimChannelPointEconomyActionAmountObs: claimChannelPointEconomyActionObs
        .pipe(
          Stream.op.map((economyAction) => economyAction?.amountValue),
        ),
      claimXpEconomyActionObs,
      claimXpEconomyActionAmountObs: claimXpEconomyActionObs.pipe(
        Stream.op.map((economyAction) => economyAction?.amountValue),
      ),
      claimTimerCountdownSecondsObs:
        claimXpEconomyActionAndClaimChannelPointActionObs.pipe(
          Stream.op.map(
            ([claimXpEconomyAction, claimChannelPointEconomyAction]) => {
              const cooldownSeconds =
                claimChannelPointEconomyAction?.data?.cooldownSeconds ||
                claimXpEconomyAction?.data?.cooldownSeconds;
              if (cooldownSeconds) {
                return Math.max(cooldownSeconds, DEFAULT_INTERVAL_SECONDS);
              } else {
                return DEFAULT_TIMER_SECONDS;
              }
            },
          ),
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
  } = useStream(() => ({
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
      lastUpdateTimeRef.current,
    );

    const secondsSinceInitialLoad = secondsSinceByMilliseconds(
      updatedTime,
      initialTimeRef.current,
    );
    timeWatchedSecondsStream.next(secondsSinceInitialLoad);

    // update the server every 60s to keep track of watch time progress
    const shouldUpdateWatchTime =
      secondsElapsedSinceLastUpdate >= UPDATE_WATCH_TIME_FREQ_SECONDS;

    if (shouldUpdateWatchTime) {
      // refresh this cookie for another ALLOWED_TIME_AWAY_MS
      cookie.set(INITIAL_TIME_MS_COOKIE, initialTimeRef.current, {
        ttlMs: ALLOWED_TIME_AWAY_MS,
      });
      // refresh last claim time cookie
      cookie.set(
        LAST_CLAIM_TIME_MS_COOKIE,
        cookie.get(LAST_CLAIM_TIME_MS_COOKIE),
        { ttlMs: ALLOWED_TIME_AWAY_MS },
      );
      lastUpdateTimeStream.next(Date.now());
      const secondsWatched = secondsElapsedSinceLastUpdate;

      if (source?.sourceType) {
        await model.watchTime.increment(secondsWatched, source.sourceType);
      }
    }

    watchTimeStream.next(updatedTime);
  };

  const decrementTimer = () => {
    const currentTime = Date.now();

    const secondsSinceDecrementStart = secondsSinceByMilliseconds(
      currentTime,
      decrementStartTimeRef.current,
    );

    const secondsRemaining = secondsSinceBySeconds(
      claimTimerCountdownSeconds,
      secondsSinceDecrementStart,
    );

    secondsRemainingStream.next(secondsRemaining);

    if (secondsRemaining <= 0) {
      isClaimButtonVisibleStream.next(true);
      onFinishedCountdown();
    }
  };

  const onClaimHandler = async () => {
    cookie.set(LAST_CLAIM_TIME_MS_COOKIE, Date.now(), {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
    decrementStartTimeStream.next(Date.now());
    isClaimButtonVisibleStream.next(false);

    clearTimeout(messageTimerRef.current);

    if (source?.sourceType) {
      const economyTransactions = await model.watchTime.claim(
        source.sourceType,
      );

      const channelPointsClaimed = Legacy._.find(economyTransactions, {
        amountId: claimChannelPointEconomyAction?.amountId,
      })?.amountValue || claimChannelPointEconomyActionAmount;
      const xpClaimed = Legacy._.find(economyTransactions, {
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

    if (!cookie.get("hasReceivedInitial")) {
      cookie.set("hasReceivedInitial", "1");
      isClaimButtonVisibleStream.next(true);
    }

    if (!cookie.get("hasReceivedInitialExtra")) {
      cookie.set("hasReceivedInitialExtra", "1");
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
    model.image.getSrcByImageObj(darkChannelPointsImageObj) ??
      "https://cdn.bio/assets/images/features/chrome_extension/channel-points-default-dark.svg";
  const fullTitle = hasChannelPoints && hasBattlePass
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
    <div className="z-channel-points" title={fullTitle}>
      {
        <div
          className={`claim ${
            classKebab({ hasText, isVisible: isClaimButtonVisible })
          }`}
          style={{
            background: highlightButtonBg,
            backgroundColor: cssVars.$tertiaryBase,
          }}
          onClick={onClaimHandler}
        >
          <div className="icon">
            <Component
              slug="image-by-aspect-ratio"
              props={{
                imageUrl: darkChannelPointsSrc,
                aspectRatio: 1,
                widthPx: 16,
                height: 16,
              }}
            />
          </div>
          {hasText && <div className="title">{shortTitle}</div>}
        </div>
      }
    </div>
  );
}
