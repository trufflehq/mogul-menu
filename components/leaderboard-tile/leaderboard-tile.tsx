import React, { useMemo } from "https://npm.tfl.dev/react";
import _ from "https://npm.tfl.dev/lodash?no-check";
import { gql, queryObservable } from "https://tfl.dev/@truffle/api@^0.1.0/client.ts";
import useObservables from "https://tfl.dev/@truffle/utils@~0.0.2/obs/use-observables-react.ts";

import Avatar from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/avatar/avatar.tsx";

import Tile from "../tile/tile.tsx";

import { TROPHY_ICON } from "../../util/icon/paths.ts";
import { op } from "https://tfl.dev/@truffle/utils@~0.0.2/obs/subject.ts";

const LEADERBOARD_LIMIT = 3;

const ORG_USER_COUNTER_TYPE_QUERY = gql`
  query OrgUserCounterTypeQuery {
    seasonPass {
      orgUserCounterTypeId
    }
  }
`;

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

export function LeaderboardTile() {
  // const { leaderboardCountersObs } = useMemo(() => {
  //   const seasonPassObs = getModel().seasonPass.getCurrent();
  //   const leaderboardCountersObs = seasonPassObs.pipe(
  //     op.switchMap((seasonPass) =>
  //       seasonPass
  //         ? getModel().orgUserCounter.getAllByCounterTypeId(
  //           seasonPass.orgUserCounterTypeId,
  //           { limit: LEADERBOARD_LIMIT },
  //         )
  //         : Obs.of(null)
  //     ),
  //   );

  //   return {
  //     leaderboardCountersObs,
  //   };
  // }, []);

  // const { leaderboardCounters } = useObservables(() => ({
  //   leaderboardCounters: leaderboardCountersObs,
  // }));

  const { leaderboardCountersObs } = useMemo(() => {
    const leaderboardCountersObs = queryObservable(
      ORG_USER_COUNTER_TYPE_QUERY,
    ).pipe(
      op.switchMap(({ data }: any) =>
        queryObservable(LEADERBOARD_COUNTER_QUERY, {
          limit: LEADERBOARD_LIMIT,
          orgUserCounterTypeId: data?.seasonPass?.orgUserCounterTypeId,
        })
      ),
      op.map(({ data }) => data?.orgUserCounterConnection),
    );

    return {
      leaderboardCountersObs,
    };
  }, []);

  const { leaderboardCounters } = useObservables(() => ({
    leaderboardCounters: leaderboardCountersObs,
  }));

  let userRanks = _.map(leaderboardCounters?.nodes, (orgUserCounter, i) => {
    return {
      ...orgUserCounter,
      count: parseInt(orgUserCounter.count),
    };
  });

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
      headerText="Top Battlepass"
      color="#CEDEE3"
      textColor="black"
      content={() => (
        <div className="content">
          <link
            rel="stylesheet"
            href={new URL("leaderboard-tile.css", import.meta.url).toString()}
          />
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
