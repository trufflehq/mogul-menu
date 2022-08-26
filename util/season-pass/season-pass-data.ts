import { useMemo, useQuery } from "../../deps.ts";
import { SEASON_PASS_QUERY } from "../../gql/season-pass.gql.ts";

export function useSeasonPassData() {
  const [{ data, fetching, error }] = useQuery({
    query: SEASON_PASS_QUERY,
    context: useMemo(
      () => ({
        additionalTypenames: ["OrgUserCounter", "CollectibleConnection", "Collectible", "OwnedCollectible", "ActivePowerup"],
      }),
      [],
    ),
  });

  return { data, fetching, error };
}
