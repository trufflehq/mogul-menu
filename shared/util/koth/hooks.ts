import { gql, useUrqlQuerySignal } from "../../../deps.ts";

export const KOTH_ORG_CONFIG_QUERY = gql`
  query KOTHOrgQuery {
    org {
      orgConfig {
        data
      }
    }
  }
`;

export function useOrgKothConfigQuery$() {
  const { signal$: orgKothConfig$, reexecuteQuery: reexecuteKothConfigQuery } = useUrqlQuerySignal(
    KOTH_ORG_CONFIG_QUERY,
  );

  return { orgKothConfig$, reexecuteKothConfigQuery };
}
