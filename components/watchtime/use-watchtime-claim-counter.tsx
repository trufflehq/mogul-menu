import {
  _,
  getCookie,
  GLOBAL_JUMPER_MESSAGES,
  jumper,
  setCookie,
  useEffect,
  useMutation,
  useObserve,
  useQuery,
  useSignal,
} from "../../deps.ts";
import { MOGUL_MENU_JUMPER_MESSAGES } from "../../shared/mod.ts";
import { ECONOMY_ACTION_QUERY, WATCH_TIME_CLAIM_MUTATION } from "./gql.ts";
import useTimer from "./use-timer.tsx";

const CHANNEL_POINTS_CLAIM_TRIGGER_ID = "41760be0-6f68-11ec-b706-956d4fcf75c0";
// const XP_CLAIM_TRIGGER_ID = "fc93de80-929e-11ec-b349-c56a67a258a0";
const UPDATE_WATCH_TIME_FREQ_MS = 60 * 1000; // 1 min
// keep their state if they're gone from stream for < this amount of time
// this is a fix for if they're just refreshing, or if they're going fullscreen (component gets reloaded)
// we could reset more frequently (ie shorter amount of time here), but for now we're
// tying the cookie ttl refresh to the UPDATE_WATCH_TIME_FREQ_MS (probably good to not update cookies too often)
const ALLOWED_TIME_AWAY_MS = UPDATE_WATCH_TIME_FREQ_MS + 10 * 1000;
const LAST_CLAIM_TIME_MS_COOKIE = "extensionLastClaimTimeMs";

const DEFAULT_TIMER_MS = 5 * 5 * 1000; // 5 min

export default function useWatchtimeClaimCounter({ sourceType }: {
  sourceType: string;
}) {
  const [_watchtimeClaimResult, executeWatchtimeClaimMutation] = useMutation(
    WATCH_TIME_CLAIM_MUTATION,
  );
  const [{ data: channelPointsClaimEconomyActionData }] = useQuery({
    query: ECONOMY_ACTION_QUERY,
    variables: {
      economyTriggerId: CHANNEL_POINTS_CLAIM_TRIGGER_ID,
    },
  });
  const channelPointsClaimEconomyAction = channelPointsClaimEconomyActionData?.economyAction;

  // const [{ data: claimXpEconomyActionData }] = useQuery({
  //   query: ECONOMY_ACTION_QUERY,
  //   variables: {
  //     economyTriggerId: XP_CLAIM_TRIGGER_ID,
  //   },
  // });
  // const claimXpEconomyAction = claimXpEconomyActionData?.economyAction;

  const lastClaimTimeMsFromCookie = getCookie(LAST_CLAIM_TIME_MS_COOKIE);
  const lastClaimTimeMs = lastClaimTimeMsFromCookie
    ? !isNaN(lastClaimTimeMsFromCookie) ? parseInt(lastClaimTimeMsFromCookie) : Date.now()
    : Date.now();

  const claimCountdownSeconds = channelPointsClaimEconomyAction?.data?.cooldownSeconds;
  const baseClaimCountdownMs = claimCountdownSeconds
    ? claimCountdownSeconds * 1000
    : DEFAULT_TIMER_MS;
  const timeSinceLastClaimTimeMs = Date.now() - lastClaimTimeMs;

  const claimCountdownMs$ = useSignal(baseClaimCountdownMs - timeSinceLastClaimTimeMs);
  const canClaim$ = useSignal(claimCountdownMs$.get() > 0 ? false : true);

  useTimer({ timerMs$: claimCountdownMs$ });

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === MOGUL_MENU_JUMPER_MESSAGES.RESET_TIMER) {
        canClaim$.set(false);
        resetTimer();
      }
    });
  }, []);

  // every second
  useObserve(() => {
    if (claimCountdownMs$.get() <= 0 && !canClaim$.peek()) {
      canClaim$.set(true);
    }
    // set a cookie for when they started watching
    // we'll give them benefit of the doubt where they can stop watching for up to 70 seconds
    // and if they come back it'll resume their timer
    // refresh this cookie for another ALLOWED_TIME_AWAY_MS
    setCookie(LAST_CLAIM_TIME_MS_COOKIE, lastClaimTimeMs, {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });
  });

  const claim = async () => {
    canClaim$.set(false);
    resetTimer();
    setCookie(LAST_CLAIM_TIME_MS_COOKIE, Date.now(), {
      ttlMs: ALLOWED_TIME_AWAY_MS,
    });

    jumper.call("comms.postMessage", GLOBAL_JUMPER_MESSAGES.INVALIDATE_USER);
    jumper.call("comms.postMessage", MOGUL_MENU_JUMPER_MESSAGES.RESET_TIMER);
    jumper.call("comms.postMessage", MOGUL_MENU_JUMPER_MESSAGES.INVALIDATE_CHANNEL_POINTS);

    if (sourceType) {
      const economyTransactions = await executeWatchtimeClaimMutation({ sourceType }, {
        additionalTypenames: [
          "OrgUserCounter",
          "OwnedCollectible",
          "SeasonPassProgression",
          "ActivePowerup",
          "EconomyTransaction",
        ],
      });

      // const channelPointsClaimed = _.find(economyTransactions, {
      //   amountId: channelPointsClaimEconomyAction?.amountId,
      // })?.amountValue || channelPointsClaimEconomyAction?.amountValue;
      // const xpClaimed = _.find(economyTransactions, {
      //   amountId: claimXpEconomyAction?.amountId,
      // })?.amountValue || claimXpEconomyAction?.amountValue;
      // return {
      //   channelPointsClaimed,
      //   xpClaimed,
      // };
    }
  };

  const resetTimer = () => {
    claimCountdownMs$.set(baseClaimCountdownMs);
  };

  useEffect(() => {
    if (!getCookie("hasReceivedInitial")) {
      setCookie("hasReceivedInitial", "1");
      canClaim$.set(true);
    }

    if (!getCookie("hasReceivedInitialExtra")) {
      setCookie("hasReceivedInitialExtra", "1");
    }
  }, []);

  return { resetTimer, claim, claimCountdownMs$, canClaim$ };
}
