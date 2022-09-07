import { gql } from "../../../deps.ts";

export const ME_CONNECTIONS_QUERY = gql`
  query {
    me {
      id
      name
      email
      phone
      avatarImage {
        cdn
        prefix
        ext
        variations {
          postfix
          width
          height
        }
        aspectRatio
      }
      connectionConnection(sourceTypes: ["youtube", "twitch"]) {
        nodes {
          id
          sourceType
        }
      }
    }
  }
`;
