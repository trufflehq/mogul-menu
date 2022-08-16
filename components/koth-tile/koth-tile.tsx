import React, { useMemo } from "https://npm.tfl.dev/react";
import Avatar from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/avatar/avatar.tsx";
import { Obs, op } from "https://tfl.dev/@truffle/utils@~0.0.2/obs/subject.ts";
import { gql, queryObservable } from "https://tfl.dev/@truffle/api@^0.1.0/client.ts";
import useObservables from "https://tfl.dev/@truffle/utils@~0.0.2/obs/use-observables-react.ts";

import { CROWN_ICON } from "../../util/icon/paths.ts";
import ActivePowerups from "../active-powerups/active-powerups.tsx";
import Tile from "../tile/tile.tsx";

const ORG_QUERY = gql`
  query KOTHOrgQuery {
    org {
      orgConfig {
        data
      }
    }
  }
`;

const KOTH_USER_QUERY = gql`
  query KOTHUserQuery($userId: ID!) {
    orgUser(input: { userId: $userId }) {
      name
      activePowerupConnection {
        nodes {
          powerup {
            jsx
          }
        }
      }
    }
  }
`;

export default function KothTile() {
  const { kingOrgUserObs } = useMemo(() => {
    const kingOrgUserObs = queryObservable(ORG_QUERY).pipe(
      op.map(({ data }: any) => data?.org?.orgConfig),
      op.switchMap((orgConfig: any) =>
        orgConfig?.data?.kingOfTheHill?.userId
          ? queryObservable(KOTH_USER_QUERY, {
            userId: orgConfig?.data?.kingOfTheHill?.userId,
          })
          : Obs.of({})
      ),
      op.map(({ data }: any) => data?.orgUser),
    );
    return {
      kingOrgUserObs,
    };
  }, []);

  const { kingOrgUser } = useObservables(() => ({
    kingOrgUser: kingOrgUserObs,
  }));

  if (!kingOrgUser) return;

  const activePowerups = kingOrgUser.activePowerupConnection?.nodes;

  return (
    <Tile
      className="c-king-tile"
      icon={CROWN_ICON}
      headerText="King of the Hill"
      color="#E0BB72"
      content={() => (
        <div className="content">
          <link
            rel="stylesheet"
            href={new URL("koth-tile.css", import.meta.url).toString()}
          />
          <div className="avatar">
            <Avatar user={kingOrgUser?.user} size={"56px"} />
          </div>
          <div className="info">
            <div className="username">{kingOrgUser.name}</div>
            <div className="powerups">
              <ActivePowerups activePowerups={activePowerups} />
            </div>
          </div>
        </div>
      )}
    />
  );
}
