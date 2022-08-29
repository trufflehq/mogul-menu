import { useMemo, useQuery } from "../../../deps.ts";
import { OwnedCollectibleConnection } from "../../../types/mod.ts";
import { OWNED_COLLECTIBLE_GET_ALL_BY_ME_QUERY } from "./gql.ts";

interface OwnedCollectibleData {
  ownedCollectibleConnection: OwnedCollectibleConnection;
}

export function useOwnedCollectibleConnection() {
  const [
    {
      data: ownedCollectibleConnectionData,
    },
    reexecuteOwnedCollectibleConnQuery,
  ] = useQuery({
    query: OWNED_COLLECTIBLE_GET_ALL_BY_ME_QUERY,
    requestPolicy: "network-only",
    context: useMemo(
      () => ({
        additionalTypenames: [
          "OwnedCollectible",
          "CollectibleConnection",
          "Collectible",
          "ActivePowerup",
        ],
      }),
      [],
    ),
  });
  return {
    ownedCollectibleConnectionData: ownedCollectibleConnectionData as OwnedCollectibleData,
    reexecuteOwnedCollectibleConnQuery,
  };
}
