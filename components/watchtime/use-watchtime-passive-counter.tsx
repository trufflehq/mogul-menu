import {
  _,
  getCookie,
  React,
  setCookie,
  signal,
  useMutation,
  useObserve,
  useSignal,
} from "../../deps.ts";

import { WATCH_TIME_INCREMENT_MUTATION } from "./gql.ts";

const UPDATE_WATCH_TIME_FREQ_MS = 60 * 1000; // 1 min
// keep their state if they're gone from stream for < this amount of time
// this is a fix for if they're just refreshing, or if they're going fullscreen (component gets reloaded)
// we could reset more frequently (ie shorter amount of time here), but for now we're
// tying the cookie ttl refresh to the UPDATE_WATCH_TIME_FREQ_MS (probably good to not update cookies too often)
const ALLOWED_TIME_AWAY_MS = UPDATE_WATCH_TIME_FREQ_MS + 10 * 1000;
const INITIAL_TIME_MS_COOKIE = "extensionInitialTimeMs";
const LAST_CLAIM_TIME_MS_COOKIE = "extensionLastClaimTimeMs";

export default function useWatchtimePassiveCounter(
  { sourceType }: { sourceType: string },
) {
  const [_incrementWatchtimeResult, executeIncrementWatchtimeMutation] = useMutation(
    WATCH_TIME_INCREMENT_MUTATION,
  );
  const initialTimeMsFromCookie = getCookie(INITIAL_TIME_MS_COOKIE);
  const initialTimeMs = initialTimeMsFromCookie ? parseInt(initialTimeMsFromCookie) : Date.now();

  const lastUpdateTime$ = useSignal(0);
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
  });

  useObserve(() => {
    // update the server every 60s to keep track of watch time progress
    const msSinceLastUpdate = Date.now() - lastUpdateTime$.get();
    const shouldUpdateWatchtime = msSinceLastUpdate >= UPDATE_WATCH_TIME_FREQ_MS;
    if (shouldUpdateWatchtime) {
      refreshCookie(INITIAL_TIME_MS_COOKIE);
      refreshCookie(LAST_CLAIM_TIME_MS_COOKIE);

      if (sourceType) {
        executeIncrementWatchtimeMutation({
          secondsWatched: msSinceLastUpdate / 1000,
          sourceType,
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
  });

  return { timeWatchedMs$ };
}

function refreshCookie(cookie) {
  setCookie(
    cookie,
    getCookie(cookie),
    { ttlMs: ALLOWED_TIME_AWAY_MS },
  );
}
