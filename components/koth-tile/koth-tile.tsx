import {
  Avatar,
  gql,
  React,
  useEffect,
  useMutation,
  useQuerySignal,
  useSelector,
  useStyleSheet,
} from "../../deps.ts";
import { KOTHOrgUser } from "../../types/mod.ts";
import {
  CROWN_ICON,
  hasPermission,
  useOrgKothConfigQuery$,
  useOrgUserWithRoles$,
} from "../../shared/mod.ts";
import { KOTH_USER_QUERY } from "./gql.ts";
import ActivePowerups from "../active-powerups/active-powerups.tsx";
import Tile from "../tile/tile.tsx";

import styleSheet from "./koth-tile.scss.js";

const DELETE_KOTH_MUTATION = gql`
mutation {
  orgConfigUpsert(input: { data: { kingOfTheHill: { userId: "" } } }) {
    orgConfig {
      data
    }
  }
}
`;

const KOTH_POLL_INTERVAL = 10000;
export default function KothTile() {
  useStyleSheet(styleSheet);
  const orgUserWithRoles$ = useOrgUserWithRoles$();
  const { orgKothConfig$, reexecuteKothConfigQuery } = useOrgKothConfigQuery$();
  const [_deleteKothResult, executeDeleteKothResult] = useMutation(DELETE_KOTH_MUTATION);
  useEffect(() => {
    const id = setInterval(() => {
      reexecuteKothConfigQuery({ requestPolicy: "network-only" });
    }, KOTH_POLL_INTERVAL);

    return () => clearInterval(id);
  }, []);

  const kothUserId = useSelector(() =>
    orgKothConfig$.value.data?.org?.orgConfig?.data?.kingOfTheHill?.userId.get!()
  );

  const hasKothDeletePermission = useSelector(() =>
    hasPermission({
      orgUser: orgUserWithRoles$.value.orgUser.get!(),
      actions: ["update"],
      filters: {
        orgConfig: { isAll: true, rank: 0 },
      },
    })
  );

  const kothUser$ = useQuerySignal(KOTH_USER_QUERY, { userId: kothUserId });
  const kothOrgUser = useSelector(() => kothUser$.value.orgUser.get!());
  const onDelete = async () => {
    await executeDeleteKothResult();
  };

  if (!kothUserId || !kothOrgUser) return <></>;

  return (
    <MemoizedTile
      kothOrgUser={kothOrgUser}
      onRemove={hasKothDeletePermission ? onDelete : undefined}
    />
  );
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

function OrgUserTile(
  { kothOrgUser, onRemove }: { kothOrgUser?: KOTHOrgUser; onRemove?: () => void },
) {
  const activePowerups = kothOrgUser?.activePowerupConnection?.nodes;

  return (
    <Tile
      className="c-king-tile"
      icon={CROWN_ICON}
      headerText="King of the Hill"
      color="#E0BB72"
      onRemove={onRemove}
      removeTooltip="Remove"
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
