import { useMemo, useQuery } from "../../../deps.ts";
import { MeConnectionUser } from "../../../types/mod.ts";
import { USER_INFO_QUERY, ME_CONNECTIONS_QUERY} from "./gql.ts";

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

export function useMeConnectionQuery() {
  const [{ data: meRes, fetching: isFetchingUser }, refetchMeConnections] = useQuery({
    query: ME_CONNECTIONS_QUERY,
  });

  return { meWithConnections: meRes?.me as MeConnectionUser, isFetchingUser, refetchMeConnections };
}
