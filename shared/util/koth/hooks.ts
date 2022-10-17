import { gql, useEffect, usePollingQuerySignal, useUrqlQuerySignal } from "../../../deps.ts";

interface KothOrgConfig {
  org: {
    orgConfig: {
      data: {
        kingOfTheHill: {
          userId: string;
        };
        [x: string]: unknown;
      };
    };
  };
}

export const KOTH_ORG_CONFIG_QUERY = gql<KothOrgConfig>`
  query KOTHOrgQuery {
    org {
      orgConfig {
        data
      }
    }
  }
`;
const KOTH_POLL_INTERVAL = 10000;
export function usePollingOrgKothConfigQuery$(
  { interval = KOTH_POLL_INTERVAL }: { interval?: number },
) {
  const {
    signal$: orgKothConfig$,
    reexecuteQuery: reexecuteKothConfigQuery,
  } = usePollingQuerySignal({
    interval,
    query: KOTH_ORG_CONFIG_QUERY,
  });

  return { orgKothConfig$, reexecuteKothConfigQuery };
}
