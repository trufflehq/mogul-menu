import { gql, useUrqlQuerySignal } from "../../../deps.ts";

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

export function useLeaderboardDisplay$(key: string) {
  const { signal$: leaderboardDisplay$, reexecuteQuery: reexecuteLeaderboardDisplayQuery } =
    useUrqlQuerySignal(
      ORG_LEADERBOARD_DISPLAY_QUERY,
      { key },
    );

  return { leaderboardDisplay$, reexecuteLeaderboardDisplayQuery };
}
