import { gql } from "../../deps.ts";
export const ACTIVE_POLL_QUERY = gql`
query PredictionPoll {
  pollConnection(first: 50) {
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

export const CHANNEL_POINTS_QUERY = gql`
query ChannelPointsQuery {
  channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
    orgUserCounter {
      count
    }
  }
}
`;

export const VOTE_MUTATION = gql`
mutation PollVote($additionalData: JSON!, $voteCount: Float!) {
  economyTransactionCreate(
    input: {
      economyTriggerSlug: "prediction-vote"
      additionalData: $additionalData
      amountValue: $voteCount
    }
  ) {
    economyTransaction {
      id
    }
  }
}
`;
