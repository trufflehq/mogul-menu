import { gql } from "../../deps.ts";

export const USER_KV_QUERY = gql`
  query GetUserKeyValue($key: String!) {
    orgUser {
      keyValue(input: { key: $key }) {
        key
        value
      }
    }
  }
`;

export const USER_KV_MUTATION = gql`
  mutation SetUserKeyValue($key: String!, $value: String!) {
    keyValueUpsert(input: {
      sourceType: "user",
      key: $key,
      value: $value
    }) {
      keyValue {
        key
        value
      }
    }
  }
`;
