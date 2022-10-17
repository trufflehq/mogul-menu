import { gql, usePollingQuerySignal } from "../../../deps.ts";

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

export function usePollingLeaderboardDisplay$(
  { interval, key }: { interval: number; key: string },
) {
  const {
    signal$: leaderboardDisplay$,
    reexecuteQuery: reexecuteLeaderboardDisplayQuery,
  } = usePollingQuerySignal({
    interval,
    query: ORG_LEADERBOARD_DISPLAY_QUERY,
    variables: {
      key,
    },
  });

  return { leaderboardDisplay$, reexecuteLeaderboardDisplayQuery };
}
