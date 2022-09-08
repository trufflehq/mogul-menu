import { gql } from "../../../deps.ts";

export const USER_INFO_QUERY = gql`
  query UserInfoQuery {
    me {
      id
      name
    }
    org {
      id
      slug
    }
    channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
      orgUserCounter {
        count
      }
    }
    seasonPass {
      xp: orgUserCounter {
        count
      }
    }
    activePowerupConnection {
      nodes {
        id
        powerup {
          id
          name
          slug
          componentRels {
            props
          }
        }
      }
    }
  }
`;

export const ME_CONNECTIONS_QUERY = gql`
  query {
    me {
      name
      connectionConnection(sourceTypes: ["youtube", "twitch"]) {
        nodes {
          id
          sourceType
        }
      }
    }
  }
`;
