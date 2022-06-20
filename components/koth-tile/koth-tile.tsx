import React from "react";
import Tile from "../tile/tile.tsx";

export default function KothTile() {
  // const { kingOrgUserObs } = useMemo(() => {
  //   const orgConfigObs = getModel().orgConfig.getMeWithData();
  //   const kingOrgUserObs = orgConfigObs.pipe(
  //     op.switchMap((orgConfig) =>
  //       orgConfig?.data?.kingOfTheHill?.userId
  //         ? getModel().orgUser.getByUserIdWithPowerups(
  //             orgConfig?.data?.kingOfTheHill?.userId
  //           )
  //         : Obs.of(null)
  //     )
  //   );
  //   return {
  //     kingOrgUserObs,
  //   };
  // }, []);

  // const { kingOrgUser } = useObservables(() => ({
  //   kingOrgUser: kingOrgUserObs,
  // }));

  const kingOrgUser = null;

  if (!kingOrgUser) return;

  const activePowerups = kingOrgUser.activePowerupConnection?.nodes;

  return (
    <Tile
      className="king-tile"
      icon={CROWN_ICON}
      headerText="King of the Hill"
      color="#E0BB72"
      content={() => (
        <div className="content">
          <div className="avatar">
            <Component
              slug="avatar"
              props={{
                user: kingOrgUser?.user,
                size: "56px",
              }}
            />
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
