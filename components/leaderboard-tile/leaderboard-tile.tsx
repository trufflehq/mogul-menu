import { Avatar, gql, React, useQuery, useStyleSheet, _ } from "../../deps.ts";

import Tile from "../tile/tile.tsx";

import { TROPHY_ICON } from "../../util/icon/paths.ts";

import styleSheet from "./leaderboard-tile.scss.js";

const LEADERBOARD_LIMIT = 3;

const LEADERBOARD_COUNTER_QUERY = gql`
  query LeaderboardQuery($orgUserCounterTypeId: ID!, $limit: Int) {
    orgUserCounterConnection(
      input: { orgUserCounterTypeId: $orgUserCounterTypeId }
      first: $limit
    ) {
      nodes {
        count
        orgUser {
          user {
            id
            name
            avatarImage {
              data
            }
          }
        }
      }
    }
  }
`;

export function LeaderboardTile({
  headerText,
  orgUserCounterTypeId,
}: {
  headerText: string;
  orgUserCounterTypeId: string;
}) {
  useStyleSheet(styleSheet);

  const [{ data: leaderboardCounterData }] = useQuery({
    query: LEADERBOARD_COUNTER_QUERY,
    variables: {
      limit: LEADERBOARD_LIMIT,
      orgUserCounterTypeId: orgUserCounterTypeId,
    },
  });

  const leaderboardCounters = leaderboardCounterData?.orgUserCounterConnection;

  let userRanks = _.map(
    leaderboardCounters?.nodes,
    (orgUserCounter, i: number) => {
      return {
        ...orgUserCounter,
        count: parseInt(orgUserCounter.count),
      };
    }
  );

  userRanks = _.orderBy(userRanks, ["count"], ["desc"]);
  userRanks = _.uniqBy(userRanks, (rank) => rank.orgUser?.user?.id);
  userRanks = _.map(userRanks, (rank, i) => ({ ...rank, place: i }));

  const top3 = _.take(userRanks, 3);
  const ranks = [
    {
      text: "1st",
      color: "#EBC564",
    },
    {
      text: "2nd",
      color: "#ADBCCD",
    },
    {
      text: "3rd",
      color: "#EE8A41",
    },
  ];

  return (
    <Tile
      className="c-leaderboard-tile"
      icon={TROPHY_ICON}
      headerText={headerText}
      color="#CEDEE3"
      textColor="black"
      content={() => (
        <div className="content">
          {top3.map((contestant, idx) => (
            <div className="contestant" key={idx}>
              <div
                className="avatar"
                style={{
                  borderColor: ranks[idx].color,
                }}
              >
                <Avatar user={contestant?.orgUser?.user} size="44px" />
                <div className="username">
                  {contestant?.orgUser?.user?.name}
                </div>
              </div>
              <div
                className="rank"
                style={{
                  color: ranks[idx].color,
                }}
              >
                {ranks[idx].text}
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
}
