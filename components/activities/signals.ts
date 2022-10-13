import {
  _,
  gql,
  signal,
  useEffect,
  useObserve,
  useSignal,
  useUrqlQuerySignal,
} from "../../deps.ts";
import { ActivityConnection } from "../../types/mod.ts";

const ACTIVITY_CONNECTION_QUERY_STR =
  `query AlertsReadyByType($status: String, $type: String, $limit: Int)
{
    alertConnection(
        input: {
            status: $status,
            type: $type
        },
        first: $limit
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
}`;

export function usePollingActivityAlertConnection$<ActivityType, SourceType extends string>(
  { interval = 2000, limit = 1 }: {
    interval?: number;
    limit?: number;
  },
) {
  // define query inside hook to pull in type constraints
  const activityConnectionQuery = gql<
    { alertConnection: ActivityConnection<ActivityType, SourceType> }
  >`${ACTIVITY_CONNECTION_QUERY_STR}`;

  const activityAlertConnection$ = useSignal<
    ActivityConnection<ActivityType, SourceType>
  >(undefined!);
  const {
    signal$: activityAlertConnectionResponse$,
    reexecuteQuery: reexecuteActivityConnectionQuery,
  } = useUrqlQuerySignal(
    activityConnectionQuery,
    {
      status: "ready",
      type: "activity",
      limit,
    },
  );

  useEffect(() => {
    const id = setInterval(() => {
      reexecuteActivityConnectionQuery({ requestPolicy: "network-only" });
    }, interval);

    return () => clearInterval(id);
  }, []);

  useObserve(() => {
    const currentActivityConnection = activityAlertConnectionResponse$.data?.get()?.alertConnection;
    const pastActivityConnection = activityAlertConnection$.get();

    // only update if the prediction has changed
    if (
      currentActivityConnection && !_.isEqual(currentActivityConnection, pastActivityConnection)
    ) {
      activityAlertConnection$.set(currentActivityConnection);
    }
  });
  return { activityAlertConnection$, reexecuteActivityConnectionQuery };
}

export const isActivityBannerOpen$ = signal(false);
