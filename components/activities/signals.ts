import {
  _,
  gql,
  signal,
  usePollingQuerySignal,
  useSignal,
  useUpdateSignalOnChange,
} from "../../deps.ts";
import { ActivityConnection } from "../../types/mod.ts";

const ACTIVITY_CONNECTION_QUERY_STR = `query AlertsReadyByType($type: String, $limit: Int)
{
    alertConnection(
        input: {
            type: $type
        },
        first: $limit
    ) {
        nodes {
            id
            orgId
            userId
            message
            status
            type
            sourceType
            sourceId
            data
            time
            orgUser {
              name
            }
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
                    status
                }
            }
        }
}
}`;

export function usePollingActivityAlertConnection$<ActivityType, SourceType extends string>(
  { interval = 2000, limit = 1 }: {
    interval?: number;
    limit?: number;
  },
) {
  const activityAlertConnection$ = useSignal<
    { alertConnection: ActivityConnection<ActivityType, SourceType> }
  >(undefined!);

  // define query inside hook to pull in type constraints
  const activityConnectionQuery = gql<
    { alertConnection: ActivityConnection<ActivityType, SourceType> }
  >`${ACTIVITY_CONNECTION_QUERY_STR}`;

  const {
    signal$: activityAlertConnectionResponse$,
    reexecuteQuery: reexecuteActivityConnectionQuery,
  } = usePollingQuerySignal({
    interval,
    query: activityConnectionQuery,
    variables: {
      type: "activity",
      limit,
    },
  });

  useUpdateSignalOnChange(activityAlertConnection$, activityAlertConnectionResponse$.data);

  return { activityAlertConnection$, reexecuteActivityConnectionQuery };
}

export const isActivityBannerOpen$ = signal(false);
