import { gql } from "../../../deps.ts";

export const SAVE_ORG_USER_SETTINGS_MUTATION = gql`
  mutation ($username: String, $nameColor: String, $userId: String) {
    orgUserUpsert(input: { name: $username }) {
      orgUser {
        id
      }
    }

    keyValueUpsert(
      input: {
        sourceType: "user"
        sourceId: $userId
        key: "nameColor"
        value: $nameColor
      }
    ) {
      keyValue {
        key
        value
      }
    }
  }
`;

export const ORG_USER_CHAT_SETTINGS_QUERY = gql`
  query {
    orgUser {
      name
      keyValue(input: { key: "nameColor" }) {
        key
        value
      }
      user {
        id
      }
    }
  }
`;
