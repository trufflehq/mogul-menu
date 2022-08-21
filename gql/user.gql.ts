import { gql } from "../deps.ts";

export const ME_QUERY = gql`
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
    }
  }
`;

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
        }
      }
    }
  }
`;
