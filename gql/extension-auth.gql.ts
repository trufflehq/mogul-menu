import { gql } from "../deps.ts";

export const EXTENSION_TOKEN_SIGNIN_QUERY = gql`
mutation MogulTvSignIn($token: String, $isTransfer: Boolean) {
  mogulTvSignIn(token: $token, isTransfer: $isTransfer) {
    sub, name, truffleAccessToken
  }
}`;
