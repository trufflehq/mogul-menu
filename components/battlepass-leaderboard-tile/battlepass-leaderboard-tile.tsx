import { gql, React, useQuery } from "../../deps.ts";
import { LeaderboardTile } from "../leaderboard-tile/leaderboard-tile.tsx";

const BATTLEPASS_ORG_USER_COUNTER_TYPE_QUERY = gql`
  query OrgUserCounterTypeQuery {
    seasonPass {
      orgUserCounterTypeId
    }
  }
`;

export default function BattlepassLeaderboardTile() {
  const [{ data: battlepassOUCTypeData }] = useQuery({
    query: BATTLEPASS_ORG_USER_COUNTER_TYPE_QUERY,
  });

  const orgUserCounterTypeId =
    battlepassOUCTypeData?.seasonPass?.orgUserCounterTypeId;

  if (!orgUserCounterTypeId) return <></>;

  return (
    <LeaderboardTile
      headerText="Top Battlepass"
      orgUserCounterTypeId={orgUserCounterTypeId}
    />
  );
}
