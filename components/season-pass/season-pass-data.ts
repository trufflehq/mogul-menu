import { gql, useQuery } from "../../deps.ts";

const SEASON_PASS_QUERY = gql`
  query {
    seasonPass {
      id
      orgId
      name
      daysRemaining
      xp: orgUserCounter {
        count
      }
      levels {
        levelNum
        minXp
        rewards {
          sourceType
          sourceId
          tierNum
          description
          amountValue
          source {
            id
            slug
            fileRel {
              fileObj {
                cdn
                prefix
                data
                variations
                ext
              }
            }
            name
            type
            targetType
            ownedCollectible {
              count
            }
            data {
              description
              redeemType
              redeemData
            }
          }
        }
      }
      data

      seasonPassProgression {
        tierNum
        changesSinceLastViewed {
          levelNum
          rewards {
            sourceType
            sourceId
            source {
              id
              slug
              fileRel {
                fileObj {
                  cdn
                  prefix
                  data
                  variations
                  ext
                }
              }
              name
              type
              targetType
              ownedCollectible {
                count
              }
              data {
                description
                redeemType
                redeemData
              }
            }
            tierNum
            description
          }
        }
      }
    }
  }
`;

export function useSeasonPassData() {
  const [{ data, fetching, error }] = useQuery({
    query: SEASON_PASS_QUERY,
  });

  return { data, fetching, error };
}
