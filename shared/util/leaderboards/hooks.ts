import { gql, useEffect } from "../../../deps.ts";
import { useUrqlQuerySignal } from "../mod.ts";

const LEADERBOARD_DISPLAY_POLL_INTERVAL = 10000;

interface OrgLeaderboardDisplayKVResult {
  org: {
    id: string;
    keyValue: {
      value: `${boolean}`;
    };
  };
}

const ORG_LEADERBOARD_DISPLAY_QUERY = gql<OrgLeaderboardDisplayKVResult>`
query BattlepassLeaderboardKeyValue($key: String) {
  org {
    id
    keyValue(input: { key: $key }) {
      key
      value
    }
  }
}`;

export function usePollingLeaderboardDisplay$(key: string) {
  const { signal$: leaderboardDisplay$, reexecuteQuery: reexecuteLeaderboardDisplayQuery } =
    useUrqlQuerySignal(
      ORG_LEADERBOARD_DISPLAY_QUERY,
      { key },
    );

  useEffect(() => {
    reexecuteLeaderboardDisplayQuery({ requestPolicy: "network-only" });

    const id = setInterval(() => {
      reexecuteLeaderboardDisplayQuery({ requestPolicy: "network-only" });
    }, LEADERBOARD_DISPLAY_POLL_INTERVAL);

    return () => clearInterval(id);
  }, []);
  return { leaderboardDisplay$, reexecuteLeaderboardDisplayQuery };
}
