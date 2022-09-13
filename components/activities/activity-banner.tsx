import {
  gql,
  jumper,
  React,
  TruffleGQlConnection,
  useEffect,
  useMemo,
  usePollingQuery,
  useQuery,
  useStyleSheet,
} from "../../deps.ts";
import stylesheet from "./activity-banner.scss.js";
import { useOrgUserConnectionsQuery } from "../../shared/mod.ts";
import { Poll } from "../../types/mod.ts";
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
                id,
                message,
                status,
                type,
                data
                activity {
                    __typename
                    ... on Poll {
                        id
                        question
                        options {
                            text
                            index
                        }
                        endTime
                        data
                    }
                    ... on Alert {
                        id
                        message
                        type
                        data
                    }
                }
            }
    }
}
`;

type AlertStatus = "ready" | "shown";
type AlertType = "raid-stream" | "activity";

interface Alert {
  __typename: "Alert";
  id: string;
  message: string;
  status: AlertStatus;
  type: AlertType;
  data: Record<string, unknown>;
}

type Activity = Poll | Alert;

interface ActivityAlert extends Alert {
  activity: Activity;
}

type ActivityConnection = TruffleGQlConnection<ActivityAlert>;

export function useActivityConnectionQuery() {
  const [
    { data: activityData, fetching: isFetchingActivityConnection },
    refetchActivityConnectionQuery,
  ] = useQuery({
    query: ACTIVITY_CONNECTION_QUERY,
  });

  return {
    activityConnection: activityData?.alertConnection as ActivityConnection,
    isFetchingActivityConnection,
    refetchActivityConnectionQuery,
  };
}

function useFetchLatestActivity(interval = 2000) {
  const result = usePollingQuery(interval, {
    query: ACTIVITY_CONNECTION_QUERY,
    variables: {
      status: "ready",
      type: "activity",
    },
  });
  const activityConnection: ActivityConnection = result?.data?.alertConnection;

  return activityConnection?.nodes?.[0];
}

function isPoll(activity?: Activity): activity is Poll {
  return activity?.__typename === "Poll";
}

export default function ActivityBanner() {
  useStyleSheet(stylesheet);
  const { orgUser } = useOrgUserConnectionsQuery();
  // const { activityConnection } = useActivityConnectionQuery();
  const activity = useFetchLatestActivity();
  console.log("activity", activity);
  console.log("orgUser", orgUser);

  return (
    <div className="c-activity-banner">
      {isPoll(activity?.activity) && <PollBanner poll={activity.activity} />}
    </div>
  );
}

//

function PollBanner({ poll }: { poll: Poll }) {
  console.log("poll", poll);
  return (
    <div className="c-poll-banner">
      hi test
    </div>
  );
}

function PredictionBanner(poll: Poll) {
  return (
    <div className="c-prediction-banner">
      {JSON.stringify(poll)}
    </div>
  );
}

function RaidBanner(alert: Alert) {
  return (
    <div className="c-raid-banner">
      hi test
    </div>
  );
}
