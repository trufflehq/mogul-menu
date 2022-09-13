import { gql, jumper, React, useEffect, useMutation, useStyleSheet } from "../../deps.ts";
import stylesheet from "./activity-banner.scss.js";
import { useOrgUserConnectionsQuery } from "../../shared/mod.ts";

const ACTIVITY_CONNECTION_QUERY = gql`
query AlertsReadyByType($status: String, $type: String) 
    {
        alertConnection(
            input: {
                status: $status,
                type: $type
            }
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

export default function ActivityBanner() {
  useStyleSheet(stylesheet);
  const { orgUser } = useOrgUserConnectionsQuery();
  const [, fetchActivityConnection] = useMutation(ACTIVITY_CONNECTION_QUERY);

  console.log("orgUser", orgUser);

  useEffect(() => {
    (async () => {
      const result = await fetchActivityConnection({
        status: "ready",
        type: "activity",
      });
      console.log("result", result);
    });
  }, []);
  return (
    <div className="c-activity-banner">
      hi test
    </div>
  );
}
