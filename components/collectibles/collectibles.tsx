import React, {
  useContext,
  useEffect,
  useMemo,
} from "https://npm.tfl.dev/react";
import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js";
import _ from "https://npm.tfl.dev/lodash?no-check";

import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.jsx";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import { useQuery, gql } from "https://tfl.dev/@truffle/api@0.0.1/client.js";
import Collectible from "../collectible/collectible.tsx";
import { usePageStack } from "../../util/page-stack/page-stack.ts";

const TYPE_ORDER = ["redeemable", "emote"];
const ORDER_FN = ({ type }) => {
  const order = TYPE_ORDER.indexOf(type);
  return order === -1 ? 9999 : order;
};
export default function Collectibles(props) {
  const { $emptyState, onViewCollection } = props;
  // const { model } = useContext(context);

  const enqueueSnackBar = useSnackBar();
  const { pushPage, popPage } = usePageStack();

  const [
    {
      data: collectibleConnectionData,
      fetching: isFetchingCollectibles,
      error: collectibleFetchError,
    },
  ] = useQuery({
    query: gql`
      query CollectibleGetAllByMe {
        collectibleConnection {
          totalCount
          nodes {
            id
            slug
            name
            type
            targetType
            fileRel {
              fileObj {
                cdn
                data
                prefix
                contentType
                type
                variations
                ext
              }
            }
            data {
              category
              redeemType
              redeemButtonText
              redeemData
              description
            }
            ownedCollectible {
              count
            }
          }
        }
      }
    `,
  });

  useEffect(() => {
    console.log({ collectibleConnectionData });
  }, [collectibleConnectionData]);

  const collectibleConnection =
    collectibleConnectionData?.collectibleConnection;

  const sortedCollectibles = _.orderBy(
    collectibleConnection?.nodes,
    (collectible) => collectible.ownedCollectible?.count
  );
  const groups = _.groupBy(sortedCollectibles, "type");
  const groupedCollectibles = _.orderBy(
    _.map(groups, (collectibles, type) => {
      return { type, collectibles };
    }),
    ORDER_FN
  );

  // const {
  //   isEmptyStream,
  //   orgUserActivePowerupConnectionObs,
  //   activePowerupsObs,
  //   groupedCollectiblesObs,
  //   ownedCollectiblesObs,
  // } = useMemo(() => {
  //   const isEmptyStream = Stream.createStream(false);
  //   const collectibleConnectionStream = Stream.createStream();
  //   const collectibleConnectionObs = collectibleConnectionStream.obs.pipe(
  //     Stream.op.switchMap(() => model.collectible.getAllByMe())
  //   );

  //   const groupedCollectiblesObs = collectibleConnectionObs.pipe(
  //     Stream.op.map((collectibleConnection) => {
  //       const sortedCollectibles = Legacy._.orderBy(
  //         collectibleConnection.nodes,
  //         (collectible) => collectible.ownedCollectible?.count
  //       );
  //       const groups = Legacy._.groupBy(sortedCollectibles, "type");
  //       const groupedCollectibles = Legacy._.orderBy(
  //         Legacy._.map(groups, (collectibles, type) => {
  //           return { type, collectibles };
  //         }),
  //         ORDER_FN
  //       );

  //       return groupedCollectibles;
  //     })
  //   );

  //   const ownedCollectiblesObs = collectibleConnectionObs.pipe(
  //     Stream.op.map((collectibleConnection) => {
  //       return collectibleConnection?.nodes
  //         ? Legacy._.filter(
  //             collectibleConnection.nodes,
  //             (collectible) => collectible.ownedCollectible?.count > 0
  //           )
  //         : [];
  //     }),
  //     Stream.op.tap((ownedCollectibles) => {
  //       if (Legacy._.isEmpty(ownedCollectibles)) {
  //         isEmptyStream.next(true);
  //       }
  //     })
  //   );
  //   const orgUserActivePowerupConnectionObs =
  //     model.orgUser.getMeActivePowerups();

  //   const activePowerupsObs = orgUserActivePowerupConnectionObs.pipe(
  //     Stream.op.map((orgUser) => {
  //       return orgUser.activePowerupConnection.nodes ?? [];
  //     })
  //   );

  //   return {
  //     orgUserActivePowerupConnectionObs,
  //     activePowerupsObs,
  //     isEmptyStream,
  //     groupedCollectiblesObs,
  //     ownedCollectiblesObs,
  //   };
  // }, []);

  const {
    isEmpty,
    orgUser,
    // groupedCollectibles,
    activePowerups,
    ownedCollectibles,
  } = useObservables(() => ({
    // isEmpty: isEmptyStream.obs,
    // orgUser: orgUserActivePowerupConnectionObs,
    // groupedCollectibles: groupedCollectiblesObs,
    // activePowerups: activePowerupsObs,
    // ownedCollectibles: ownedCollectiblesObs,
  }));

  // const groupedCollectibles = [
  //   {
  //     type: "Redeemable",
  //     collectibles: [
  //       {
  //         name: "Collectible",
  //         type: "redeemable",
  //         targetType: "user",
  //         // ownedCollectible: { count: 3 },
  //       },
  //     ],
  //   },
  //   {
  //     type: "Emote",
  //     collectibles: [
  //       {
  //         name: "Collectible",
  //         type: "redeemable",
  //         targetType: "user",
  //         // ownedCollectible: { count: 3 },
  //       },
  //     ],
  //   },
  // ];

  if (isEmpty) return <$emptyState groupedCollectibles={groupedCollectibles} />;
  return (
    <ScopedStylesheet url={new URL("collectibles.css", import.meta.url)}>
      <div className="c-collectibles">
        {_.map(groupedCollectibles, ({ collectibles, type }, idx) => {
          return (
            <div key={idx} className="type-section">
              <div className="type">{type}</div>
              <div className="collectibles">
                {_.map(collectibles, (collectible, idx) => {
                  const powerupId = collectible?.data?.redeemData?.powerupId;
                  const activePowerup = _.find(activePowerups, {
                    powerup: { id: powerupId },
                  });

                  return (
                    (collectible?.ownedCollectible?.count > 0 ||
                      activePowerup) && (
                      <Collectible
                        key={idx}
                        collectible={collectible}
                        activePowerup={activePowerup}
                        onViewCollection={onViewCollection}
                        enqueueSnackBar={enqueueSnackBar}
                        pushPage={pushPage}
                        popPage={popPage}
                      />
                    )
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScopedStylesheet>
  );
}
