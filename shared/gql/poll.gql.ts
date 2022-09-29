import { gql } from "../../deps.ts";

export const ACTIVE_POLL_QUERY = gql`
query PredictionPoll {
  pollConnection(first: 3) {
    nodes {
      id
      question
      options {
        index
        text
        count
        unique
      }
      data
      time
      endTime
      myVote {
        optionIndex
        count
      }
    }
  }
}
`;
