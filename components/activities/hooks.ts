import { gql, useContext, usePollingQuery } from "../../deps.ts";
import { ActivityBannerContext } from "./context.ts";
import { ActivityConnection } from "../../types/mod.ts";

const ACTIVITY_CONNECTION_QUERY = gql`
query AlertsReadyByType($status: String, $type: String)
    {
        alertConnection(
            input: {
                status: $status,
                type: $type
            },
            first: 1
        ) {
            nodes {
                id
                message
                status
                type
                sourceType
                sourceId
                data
                time
                activity {
                    __typename
                    ... on Poll {
                        id
                        orgId
                        question
                        options {
                            text
                            index
                            count
                            unique
                        }
                        myVote {
                          optionIndex
                          count
                        }
                        time
                        endTime
                        data
                    }
                    ... on Alert {
                        id
                        message
                        type
                        data
                        time
                    }
                }
            }
    }
}
`;

/**
 * Returns the latest ready activity alert on an interval
 */
export function useFetchLatestActivityAlert<ActivityType, SourceType extends string>(
  interval = 2000,
) {
  const result = usePollingQuery(interval, {
    query: ACTIVITY_CONNECTION_QUERY,
    variables: {
      status: "ready",
      type: "activity",
    },
  });

  const activityConnection: ActivityConnection<ActivityType, SourceType> = result?.data
    ?.alertConnection;

  return activityConnection?.nodes?.[0];
}

export function useActivityBanner() {
  return useContext(ActivityBannerContext);
}
