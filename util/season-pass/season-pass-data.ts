import { useQuery } from "../../deps.ts";
import { SEASON_PASS_QUERY } from "../../gql/season-pass.gql.ts";

export function useSeasonPassData() {
  const [{ data, fetching, error }] = useQuery({
    query: SEASON_PASS_QUERY,
  });

  return { data, fetching, error };
}
