import { gql, GQLResponse, graphqlReq } from "./graphql-client.ts";

interface EconomyActionUpsertInput {
  name: string;
  economyTriggerId: string;
  amountType: string;
  amountId: string;
  data: Record<string, unknown>;
}

interface EconomyAction {
}

const ECONOMY_ACTION_UPSERT_MUTATION = gql`

`;

export async function economyActionUpsert(
  input: EconomyActionUpsertInput,
  accessToken: string,
  orgId: string,
) {
  const resp =
    (await graphqlReq(ECONOMY_ACTION_UPSERT_MUTATION, { input }, { accessToken, orgId }).then((
      resp,
    ) => resp.json())) as GQLResponse<{ economyActionUpsert: { economyAction: EconomyAction } }>;

  if (resp?.errors?.length > 0) {
    throw resp.errors;
  }

  return resp?.data?.economyActionUpsert.economyAction;
}

export async function createChannelPointsEconomyActions(
  channelPointsOuctId: string,
  accessToken: string,
  orgId: string,
) {
  // need to retrieve the org

  for (const economyAction of economyActions) {
    await economyActionUpsert(economyAction, accessToken, orgId);
  }
}

const economyActions = [
  {
    name: "Watch the stream",
    orgId: org.id,
    economyTriggerId: defaultEconomyTriggerIds.CHANNEL_POINTS.INCREMENT,
    amountType: "orgUserCounterType",
    amountId: orgUserCounterType.id,
    amountValue: 10,
    data: {
      description: "Earn for every 5 minutes of watch time",
      // how often to award passive channel points
      cooldownSeconds: 60 * 5,
    },
  },
  {
    id: cknex.getTimeUuidStr(),
    name: "Prediction refund",
    orgId: org.id,
    economyTriggerId: defaultEconomyTriggerIds.CHANNEL_POINTS.PREDICTION_REFUND,
    amountType: "orgUserCounterType",
    amountId: orgUserCounterType.id,
    isVariableAmount: true,
    data: {
      amountDescription: "Prediction refund",
      description:
        "If a prediction is cancelled after you've placed a bet, channel points will be refunded",
    },
  },
  {
    id: cknex.getTimeUuidStr(),
    name: "Click the claim reward button",
    orgId: org.id,
    economyTriggerId: defaultEconomyTriggerIds.CHANNEL_POINTS.CLAIM,
    amountType: "orgUserCounterType",
    amountId: orgUserCounterType.id,
    amountValue: 20,
    data: {
      description: "The button appears every 5 minutes for bonus channel points",
      // how often the claim loot button should appear
      cooldownSeconds: 60 * 5,
    },
  },
  {
    id: cknex.getTimeUuidStr(),
    name: "Channel Points Prediction",
    orgId: org.id,
    economyTriggerId: defaultEconomyTriggerIds.CHANNEL_POINTS.PREDICTION,
    amountType: "orgUserCounterType",
    amountId: orgUserCounterType.id,
    isVariableAmount: true,
    data: {
      description: "Channel Points Prediction",
      redeemType: "predictionVote",
    },
  },
  // FIXME: only server should be able to trigger this
  {
    id: cknex.getTimeUuidStr(),
    name: "Win a prediction",
    orgId: org.id,
    economyTriggerId: defaultEconomyTriggerIds.CHANNEL_POINTS.PREDICTION_WIN,
    amountType: "orgUserCounterType",
    amountId: orgUserCounterType.id,
    isVariableAmount: true,
    data: {
      amountDescription: "Proportional amount of the pool",
      description:
        "When Ludwig creates a prediction, you have the option to place a bet between 2 outcomes. Place a bet on one of the options with an amount of your channel points. If you bet on the winning outcome, you get a proportional amount of the channel points pool.",
    },
  },
  {
    id: cknex.getTimeUuidStr(),
    name: "Channel Points Admin Modification",
    orgId: org.id,
    economyTriggerId: defaultEconomyTriggerIds.CHANNEL_POINTS.ADMIN_MODIFICATION,
    amountType: "orgUserCounterType",
    amountId: orgUserCounterType.id,
    isVariableAmount: true,
    data: {
      amountDescription: "Admin modification",
      description: "An admin updated the amount of channel points",
    },
  },
];
