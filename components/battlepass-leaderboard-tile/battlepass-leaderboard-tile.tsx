import { gql, React, useQuery } from "../../deps.ts";
import { OrgUserCounterType } from "../../types/mod.ts";
import { BATTLEPASS_ORG_USER_COUNTER_TYPE_QUERY } from "./gql.ts";
import { LeaderboardTile } from "../leaderboard-tile/leaderboard-tile.tsx";

export default function BattlepassLeaderboardTile() {
  const [{ data: battlepassOUCTypeData }] = useQuery({
    query: BATTLEPASS_ORG_USER_COUNTER_TYPE_QUERY,
  });

  const orgUserCounterTypeId: OrgUserCounterType["seasonPass"]["orgUserCounterTypeId"] =
    battlepassOUCTypeData?.seasonPass?.orgUserCounterTypeId;

  if (!orgUserCounterTypeId) return <></>;
  return (
    <LeaderboardTile
      headerText="Top Battlepass"
      orgUserCounterTypeId={orgUserCounterTypeId}
    />
  );
}
