import { useMemo, useQuery } from "../../../deps.ts";
import { OrgUserConnections } from "../../../types/mod.ts";
import { ORG_USER_CONNECTIONS_QUERY, USER_INFO_QUERY } from "./gql.ts";

export function useUserInfo() {
  const [{ data: userInfoData }, reexecuteUserInfoQuery] = useQuery({
    query: USER_INFO_QUERY,
    requestPolicy: "network-only",
    context: useMemo(
      () => ({
        additionalTypenames: [
          "OwnedCollectible",
          "CollectibleConnection",
          "Collectible",
          "ActivePowerup",
          "OrgUserCounterType",
          "OrgUserCounter",
        ],
      }),
      [],
    ),
  });

  return { userInfoData, reexecuteUserInfoQuery };
}

export function useOrgUserConnectionsQuery() {
  const [{ data: orgUserData, fetching: isFetchingOrgUser }, refetchOrgUserConnections] = useQuery({
    query: ORG_USER_CONNECTIONS_QUERY,
  });

  return {
    orgUser: orgUserData?.orgUser as OrgUserConnections,
    isFetchingOrgUser,
    refetchOrgUserConnections,
  };
}
