import { gql } from "../deps.ts";

export const KOTH_ORG_CONFIG_QUERY = gql`
  query KOTHOrgQuery {
    org {
      orgConfig {
        data
      }
    }
  }
`;

export const KOTH_USER_QUERY = gql`
  query KOTHUserQuery($userId: ID!) {
    orgUser(input: { userId: $userId }) {
      name
      activePowerupConnection {
        nodes {
          powerup {
            componentRels {
              props
            }
          }
        }
      }
      user {
        id
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
      }
    }
  }
`;
