import { gql, useEffect } from "../../../deps.ts";
import { useUrqlQuerySignal } from "../mod.ts";

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
export function usePollingOrgKothConfigQuery$() {
  const { signal$: orgKothConfig$, reexecuteQuery: reexecuteKothConfigQuery } = useUrqlQuerySignal(
    KOTH_ORG_CONFIG_QUERY,
  );

  useEffect(() => {
    const id = setInterval(() => {
      reexecuteKothConfigQuery({ requestPolicy: "network-only" });
    }, KOTH_POLL_INTERVAL);

    return () => clearInterval(id);
  }, []);

  return { orgKothConfig$, reexecuteKothConfigQuery };
}
