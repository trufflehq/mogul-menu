import {
  _,
  getCookie,
  setCookie,
  useEffect,
  useQuery,
  useMutation,
  useObserve,
  useSelector,
  useSignal,
  signal
} from "../../deps.ts";

import {
  ECONOMY_ACTION_QUERY,
  WATCH_TIME_CLAIM_MUTATION,
  WATCH_TIME_INCREMENT_MUTATION
} from "./gql.ts";

const CHANNEL_POINTS_CLAIM_TRIGGER_ID = "41760be0-6f68-11ec-b706-956d4fcf75c0";
const XP_CLAIM_TRIGGER_ID = "fc93de80-929e-11ec-b349-c56a67a258a0";
const UPDATE_WATCH_TIME_FREQ_MS = 60 * 1000; // 1 min
// keep their state if they're gone from stream for < this amount of time
// this is a fix for if they're just refreshing, or if they're going fullscreen (component gets reloaded)
// we could reset more frequently (ie shorter amount of time here), but for now we're
// tying the cookie ttl refresh to the UPDATE_WATCH_TIME_FREQ_MS (probably good to not update cookies too often)
const ALLOWED_TIME_AWAY_MS = UPDATE_WATCH_TIME_FREQ_MS + 10 * 1000;
const INITIAL_TIME_MS_COOKIE = "extensionInitialTimeMs";
const LAST_CLAIM_TIME_MS_COOKIE = "extensionLastClaimTimeMs";

const DEFAULT_TIMER_MS = 60 * 5;

function Timer ({ timerMs$, Component }) {
  const timerMs = useSelector(() => timerMs$.get())

  useEffect(() => {
    const startTimeMs = Date.now()
    // time diff because setTimeout stops when browser tab isn't active
    const timeout = setTimeout(() => {
      const curVal = timerMs
      const nowMs = Date.now()
      if (curVal > 0) {
        const timeDiffMs = nowMs - startTimeMs
        let newVal = curVal - timeDiffMs
        if (newVal < 0) {
          newVal = 0
        }
        timerMs$.set(newVal)
      }
    }, 1000)

    return () => {
      clearTimeout(timeout)
    }
  }, [timerMs])

  return Component
    ? <Component timerMs={timerMs} />
    : `${timerMs}`
}

function passiveWatchTimeCounter() {
  const [_incrementWatchtimeResult, executeIncrementWatchtimeMutation] = useMutation(
    WATCH_TIME_INCREMENT_MUTATION,
  );
  const claimXpEconomyAction = useQuery({
    query: ECONOMY_ACTION_QUERY,
    variables: {
      economyTriggerId: XP_CLAIM_TRIGGER_ID,
    }
  });

  const initialTimeMsFromCookie = getCookie(INITIAL_TIME_MS_COOKIE);
  const initialTimeMs = initialTimeMsFromCookie ? parseInt(initialTimeMsFromCookie) : Date.now();

  const timeWatchedMs$ = useSignal(Date.now() - initialTimeMs);

  // every second
  useObserve(() => {
    timeWatchedMs$.get(); // useObserve is supposed to accept signal as first param, but ts didn't like that
    // set a cookie for when they started watching
    // we'll give them benefit of the doubt where they can stop watching for up to 70 seconds
    // and if they come back it'll resume their timer
    // refresh this cookie for another ALLOWED_TIME_AWAY_MS
    setCookie(INITIAL_TIME_MS_COOKIE, initialTimeMs, {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
  })

}

function claimWatchTimeCounter({
  onFinishedCountdown,
  source,
  isClaimable$,
}: {
  onFinishedCountdown?: () => void;
  source: string;
  isClaimable$: signal<boolean>;
}) {
  const [_watchtimeClaimResult, executeWatchtimeClaimMutation] = useMutation(
    WATCH_TIME_CLAIM_MUTATION,
  ); 
  const channelPointsClaimEconomyAction = useQuery({
    query: ECONOMY_ACTION_QUERY,
    variables: {
      economyTriggerId: CHANNEL_POINTS_CLAIM_TRIGGER_ID,
    }
  });

  const lastClaimTimeMsFromCookie = getCookie(LAST_CLAIM_TIME_MS_COOKIE);
  const lastClaimTimeMs = lastClaimTimeMsFromCookie
    ? !isNaN(lastClaimTimeMsFromCookie) ? parseInt(lastClaimTimeMsFromCookie) : Date.now()
    : Date.now();

  const claimCountdownSeconds = channelPointsClaimEconomyAction?.data?.cooldownSeconds;
  const baseClaimCountdownMs = claimCountdownSeconds ? claimCountdownSeconds * 1000 : DEFAULT_TIMER_MS;
  const timeSinceLastClaimTimeMs = Date.now() - lastClaimTimeMs;

  const claimCountdownMs$ = useSignal(baseClaimCountdownMs - timeSinceLastClaimTimeMs);
  const lastUpdateTime$ = useSignal(0);

  // every second
  useObserve(() => {
    claimCountdownMs$.get(); // useObserve is supposed to accept signal as first param, but ts didn't like that
    // set a cookie for when they started watching
    // we'll give them benefit of the doubt where they can stop watching for up to 70 seconds
    // and if they come back it'll resume their timer
    // refresh this cookie for another ALLOWED_TIME_AWAY_MS
    setCookie(LAST_CLAIM_TIME_MS_COOKIE, lastClaimTimeMs, {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
  })

}


export function useWatchtimeCounter({
  onFinishedCountdown,
  source,
  isClaimable,
  setIsClaimable,
}: {
  onFinishedCountdown?: () => void;
  source: string;
  isClaimable: boolean;
  setIsClaimable: (isClaimable: boolean) => void;
}) {

  useObserve(() => {
    // update the server every 60s to keep track of watch time progress
    const msSinceLastUpdate = Date.now() - lastUpdateTime$.get();
    const shouldUpdateWatchTime = msSinceLastUpdate >= UPDATE_WATCH_TIME_FREQ_MS;
    if (shouldUpdateWatchTime) {
      refreshCookie(INITIAL_TIME_MS_COOKIE);
      refreshCookie(LAST_CLAIM_TIME_MS_COOKIE);

      if (source) {
        await executeIncrementWatchtimeMutation({
          secondsWatched: msSinceLastUpdate / 1000,
          sourceType: source,
        }, {
          additionalTypenames: [
            "OrgUserCounter",
            "OwnedCollectible",
            "SeasonPassProgression",
            "ActivePowerup",
            "EconomyTransaction",
          ],
        });
      }
    }
  })

  // FIXME: isClaimButtonVisible
  // FIXME: onFinishedCountdown

  const claim = async () => {
    setCookie(LAST_CLAIM_TIME_MS_COOKIE, Date.now(), {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
    isClaimButtonVisible$.set(false);
    if (source) {
      const economyTransactions = await executeWatchtimeClaimMutation({
        sourceType: source,
      }, {
        additionalTypenames: [
          "OrgUserCounter",
          "OwnedCollectible",
          "SeasonPassProgression",
          "ActivePowerup",
          "EconomyTransaction",
        ],
      });

      const channelPointsClaimed = _.find(economyTransactions, {
        amountId: channelPointsClaimEconomyAction?.amountId,
      })?.amountValue || channelPointsClaimEconomyAction?.amountValue;
      const xpClaimed = _.find(economyTransactions, {
        amountId: claimXpEconomyAction?.amountId,
      })?.amountValue || claimXpEconomyAction?.amountValue;
      return {
        channelPointsClaimed,
        xpClaimed,
      };
    }
  };

  const resetTimer = () => {
    claimCountdownMs$.set(baseClaimCountdownMs);
  };

  useEffect(() => {
    if (!getCookie("hasReceivedInitial")) {
      setCookie("hasReceivedInitial", "1");
      isClaimButtonVisible$.set(true);
    }

    if (!getCookie("hasReceivedInitialExtra")) {
      setCookie("hasReceivedInitialExtra", "1");
    }

  }, []);

  return { claim, resetTimer };
}

function refreshCookie (cookie) {
  setCookie(
    cookie,
    getCookie(cookie),
    { ttlMs: ALLOWED_TIME_AWAY_MS },
  );
}