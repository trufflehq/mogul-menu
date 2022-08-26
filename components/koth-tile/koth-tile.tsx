import {
  Avatar,
  React,
  useEffect,
  useMemo,
  usePollingQuery,
  useQuery,
  useRef,
  useState,
  useStyleSheet,
} from "../../deps.ts";
import { KOTHOrgUser } from "../../types/mod.ts";
import { CROWN_ICON } from "../../util/icon/paths.ts";
import { KOTH_ORG_CONFIG_QUERY, KOTH_USER_QUERY } from "../../gql/mod.ts";
import ActivePowerups from "../active-powerups/active-powerups.tsx";
import Tile from "../tile/tile.tsx";

import styleSheet from "./koth-tile.scss.js";

export default function KothTile() {
  useStyleSheet(styleSheet);

  const kothUserIdRef = useRef<string>(undefined!);
  const [kothUserId, setKothUserId] = useState("");
  const orgKothConfigResponse = usePollingQuery(10000, { query: KOTH_ORG_CONFIG_QUERY });
  const orgKothConfig = orgKothConfigResponse?.data;

  const [{ data: kothUser }] = useQuery({
    query: KOTH_USER_QUERY,
    variables: {
      userId: kothUserId,
    },
    requestPolicy: "network-only",
    context: useMemo(() => ({ additionalTypenames: ["Org", "OrgConfig"] }), []),
  });

  kothUserIdRef.current = orgKothConfig?.org?.orgConfig?.data?.kingOfTheHill?.userId;

  useEffect(() => {
    setKothUserId(kothUserIdRef.current);
  }, [kothUserIdRef.current]);

  const kothOrgUser = kothUser?.orgUser;

  if (!kothOrgUser) return <></>;

  return <MemoizedTile kothOrgUser={kothOrgUser} />;
}
function arePropsEqual(prevProps: OrgUserTileProps, nextProps: OrgUserTileProps) {
  return prevProps?.kothOrgUser?.user?.id === nextProps?.kothOrgUser?.user?.id;
}

interface OrgUserTileProps {
  kothOrgUser?: KOTHOrgUser;
}

const MemoizedTile = React.memo(
  OrgUserTile,
  arePropsEqual,
);

function OrgUserTile({ kothOrgUser }: { kothOrgUser?: KOTHOrgUser }) {
  const activePowerups = kothOrgUser?.activePowerupConnection?.nodes;

  return (
    <Tile
      className="c-king-tile"
      icon={CROWN_ICON}
      headerText="King of the Hill"
      color="#E0BB72"
      content={() => (
        <div className="content">
          <div className="avatar">
            <Avatar user={kothOrgUser?.user} size={"56px"} />
          </div>
          <div className="info">
            <div className="username">{kothOrgUser?.name}</div>
            <div className="powerups">
              {activePowerups ? <ActivePowerups activePowerups={activePowerups} /> : null}
            </div>
          </div>
        </div>
      )}
    />
  );
}
