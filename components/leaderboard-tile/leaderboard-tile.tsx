import React from "react";
import _ from "https://npm.tfl.dev/lodash?no-check";
import { TROPHY_ICON } from "../../util/icon/paths.ts";
import Tile from "../tile/tile.tsx";

const LEADERBOARD_LIMIT = 3;
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

  const leaderboardCounters: any[] = [];

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
      className="leaderboard-tile"
      icon={TROPHY_ICON}
      headerText="Top Battlepass"
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
                {/* <Component
                  slug="avatar"
                  props={{
                    user: contestant?.orgUser?.user,
                    size: "44px",
                  }}
                /> */}
                <div>Avatar</div>
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
