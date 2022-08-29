import { _, Avatar, React, useQuery, useStyleSheet } from "../../deps.ts";
import { User } from "../../types/mod.ts";
import { OrgUserCounter, OrgUserCounterConnection } from "../../types/org-user-counter.types.ts";
import { LEADERBOARD_COUNTER_QUERY } from "./gql.ts";
import Tile from "../tile/tile.tsx";

import { TROPHY_ICON } from "../../shared/mod.ts";

import styleSheet from "./leaderboard-tile.scss.js";

const LEADERBOARD_LIMIT = 3;

export function LeaderboardTile({
  headerText,
  orgUserCounterTypeId,
}: {
  headerText: string;
  orgUserCounterTypeId: string;
}) {
  useStyleSheet(styleSheet);

  const [{ data: leaderboardCounterData, fetching }] = useQuery({
    query: LEADERBOARD_COUNTER_QUERY,
    variables: {
      limit: LEADERBOARD_LIMIT,
      orgUserCounterTypeId,
    },
  });

  const leaderboardCounters: OrgUserCounterConnection = leaderboardCounterData
    ?.orgUserCounterConnection;

  if (!leaderboardCounters?.nodes) return <></>;

  let userRanks = leaderboardCounters?.nodes?.map((orgUserCounter) => {
    orgUserCounter.count = parseInt(`${orgUserCounter.count}`);

    return orgUserCounter;
  })
    .sort((a, b) => a.count < b.count ? 1 : 0);

  userRanks = [...new Set(userRanks)];
  userRanks = userRanks.map((rank, i) => ({ ...rank, place: i }));

  const top3 = userRanks.slice(0, 3);

  return <MemoizedLeaderboardTile headerText={headerText} top3={top3} />;
}

const MemoizedLeaderboardTile = React.memo(LeaderboardTileBase, (prev, next) => {
  const prevUserIds = prev.top3.map((ouc) => ouc.orgUser.user.id);
  const nextUserIds = next.top3.map((ouc) => ouc.orgUser.user.id);

  return JSON.stringify(prevUserIds) === JSON.stringify(nextUserIds);
});

function LeaderboardTileBase(
  { headerText, top3 }: { headerText?: string; top3: OrgUserCounter[] },
) {
  return (
    <Tile
      className="c-leaderboard-tile"
      icon={TROPHY_ICON}
      headerText={headerText}
      color="#CEDEE3"
      textColor="black"
      content={() => <Leaderboard top3={top3} />}
    />
  );
}

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

function Leaderboard({ top3 }: { top3: OrgUserCounter[] }) {
  return (
    <div className="content">
      {top3.map((contestant, idx) => (
        <LeaderboardAvatar
          key={contestant?.orgUser?.user?.id}
          user={contestant?.orgUser?.user}
          place={ranks[idx].text}
          color={ranks[idx].color}
        />
      ))}
    </div>
  );
}

interface LeaderboardAvatarProps {
  user: User;
  place: string;
  color: string;
}

function LeaderboardAvatar({ user, place, color }: LeaderboardAvatarProps) {
  return (
    <div className="contestant">
      <div
        className="avatar"
        style={{
          borderColor: color,
        }}
      >
        <Avatar user={user} size="44px" />
        <div className="username">
          {user?.name}
        </div>
      </div>
      <div
        className="rank"
        style={{
          color: color,
        }}
      >
        {place}
      </div>
    </div>
  );
}
