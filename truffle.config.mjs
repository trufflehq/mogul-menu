// here for syntax highlighting :)
const gql = (strings) => strings.join();

export default {
  name: "@truffle/mogul-menu",
  version: "0.2.36",
  // name: "@truffle-dev-early-access/mogul-menu",
  // version: "0.5.6",
  // staging
  // apiUrl: "https://mycelium.staging.bio/graphql",
  // prod
  // apiUrl: "https://mycelium.truffle.vip/graphql",
  // localhost
  apiUrl: "http://localhost:50330/graphql",

  requestedPermissions: [
    {
      filters: { orgUserCounterType: { isAll: true, rank: 0 } },
      action: "update",
      value: true,
    },
  ],

  installActionRel: {
    actionPath: "@truffle/core@latest/_Action/workflow",
    runtimeData: {
      mode: "sequential",
      stepActionRels: [
        {
          actionPath: "@truffle/core@latest/_Action/graphql",
          runtimeData: {
            query: gql`
              mutation {
                orgUserCounterTypeUpsert(
                  input: {
                    name: "Channel points"
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
      ],
    },
  },
};
