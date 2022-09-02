import { gql } from "../../../deps.ts";

export const EXTENSION_TOKEN_SIGNIN_QUERY = gql`
mutation MogulTvSignIn($token: String, $isTransfer: Boolean) {
  mogulTvSignIn(token: $token, isTransfer: $isTransfer) {
    sub, name, truffleAccessToken
  }
}`;

export const LOGIN_TYPE_NAMES = [
  "OrgUserCounter",
  "Poll",
  "PollVote",
  "PollOption",
  "MeUser",
  "Collectible",
  "OwnedCollectible",
  "ActivePowerup",
];

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
