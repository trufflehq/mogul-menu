import { useMemo, useQuery } from "../../../deps.ts";

import { USER_INFO_QUERY } from "./gql.ts";

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
