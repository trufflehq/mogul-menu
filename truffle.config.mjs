// here for syntax highlighting :)
const gql = (strings) => strings.join();

// const ORG = "truffle"
const ORG = "dev";
const PACKAGE = `@${ORG}/mogul-menu`;

// staging @dev
const PACKAGE_ID = "";

export default {
  name: PACKAGE,
  version: "0.2.36",
  // name: "@truffle-dev-early-access/mogul-menu",
  // version: "0.5.6",
  // staging
  apiUrl: "https://mycelium.staging.bio/graphql",
  // prod
  // apiUrl: "https://mycelium.truffle.vip/graphql",
  // localhost
  // apiUrl: "http://localhost:50330/graphql",

  requestedPermissions: [
    {
      filters: {
        edgeFunction: { isAll: true, rank: 0 },
      },
      action: "update",
      value: true,
    },
    {
      filters: {
        edgeDeployment: { isAll: true, rank: 0 },
      },
      action: "update",
      value: true,
    },
    {
      filters: { orgUserCounterType: { isAll: true, rank: 0 } },
      action: "update",
      value: true,
    },
    {
      filters: { role: { isAll: true, rank: 0 } },
      action: "update",
      value: true,
    },
    {
      filters: { economyAction: { isAll: true, rank: 0 } },
      action: "update",
      value: true,
    },
  ],

  installActionRel: {
    actionPath: "@truffle/core@latest/_Action/workflow",
    runtimeData: {
      mode: "sequential",
      stepActionRels: [
        // Channel points OUCT
        {
          actionPath: "@truffle/core@latest/_Action/graphql",
          runtimeData: {
            query: gql`
              mutation {
                orgUserCounterTypeUpsert(
                  input: {
                    name: "Channel Points"
                    slug: "channel-points"
                    decimalPlaces: 0
                  }
                ) {
                  orgUserCounterType {
                    id
                  }
                }
              }
            `,
          },
        },
        // Channel points spent OUCT
        {
          actionPath: "@truffle/core@latest/_Action/graphql",
          runtimeData: {
            query: gql`
              mutation {
                orgUserCounterTypeUpsert(
                  input: {
                    name: "Channel Points Spent"
                    slug: "channel-points-spent"
                    decimalPlaces: 0
                  }
                ) {
                  orgUserCounterType {
                    id
                  }
                }
              }
            `,
          },
        },
        // Extension watch time OUCT
        {
          actionPath: "@truffle/core@latest/_Action/graphql",
          runtimeData: {
            query: gql`
              mutation {
                orgUserCounterTypeUpsert(
                  input: {
                    name: "Extension Watch Time"
                    slug: "extension-watch-time"
                    decimalPlaces: 0
                  }
                ) {
                  orgUserCounterType {
                    id
                  }
                }
              }
            `,
          },
        },
        // Extension watch time progress OUCT
        {
          actionPath: "@truffle/core@latest/_Action/graphql",
          runtimeData: {
            query: gql`
              mutation {
                orgUserCounterTypeUpsert(
                  input: {
                    name: "Extension Watch Time Progress"
                    slug: "extension-watch-time-progress"
                    decimalPlaces: 0
                  }
                ) {
                  orgUserCounterType {
                    id
                  }
                }
              }
            `,
          },
        },
        // Create action so that we can execute mm-create-economy-actions edge function
        {
          actionPath: "@truffle/core@latest/_Action/graphql",
          runtimeData: {
            query: gql`
              mutation ActionUpsert($input: ActionUpsertInput) {
                actionUpsert(input: $input) {
                  action {
                    id
                  }
                }
              }
            `,
            variables: {
              input: {
                type: "edgeFunction",
                name: "Create mm economy actions",
                description: "Creates the economy actions for mogul-menu.",
                resourcePath: `${PACKAGE}/_Action/create-economy-actions`,
                config: {
                  edgeFunctionPath: `${PACKAGE}/_EdgeFunction/create-economy-actions:${ORG}`,
                },
              },
            },
          },
        },
        // Execute mm-create-economy-actions edge function
        {
          actionPath: "@truffle/core@latest/_Action/graphql",
          runtimeData: {
            query: gql`
              mutation {
                orgUserCounterTypeUpsert(
                  input: {
                    name: "Extension Watch Time Progress"
                    slug: "extension-watch-time-progress"
                    decimalPlaces: 0
                  }
                ) {
                  orgUserCounterType {
                    id
                  }
                }
              }
            `,
          },
        },
      ],
    },
  },
  functions: [
    // TODO: update economy actions so that you can specify paths on upsert rather than ids;
    // that way we won't need this edge function
    {
      slug: "mm-create-economy-actions",
      description: "Creates and configures the economy actions for mogul menu",
      entrypoint: "./functions/src/create-economy-actions.ts",
    },
  ],
};
