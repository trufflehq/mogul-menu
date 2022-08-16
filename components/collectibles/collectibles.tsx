import React, { useContext, useEffect, useMemo } from "https://npm.tfl.dev/react";
import { getSrcByImageObj } from "../../deps.ts";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@~0.1.0/utils/snack-bar.ts";
import _ from "https://npm.tfl.dev/lodash?no-check";

import ScopedStylesheet from "../base/stylesheet/stylesheet.tsx";
import useObservables from "https://tfl.dev/@truffle/utils@~0.0.2/obs/use-observables-react.ts";
import { gql, useQuery } from "../../deps.ts";
import Collectible from "../collectible/collectible.tsx";
import { usePageStack } from "../../util/page-stack/page-stack.ts";

const COLLECTIBLE_GET_ALL_BY_ME_QUERY = gql`
  query CollectibleGetAllByMe {
    # TODO: fix this hardcoded paging and possibly
    # convert this query to an "ownedCollectibleConnection"
    # query instead of "collectibleConnection" so that we're
    # not grabbing collectibles that the user doesn't own.
    collectibleConnection(first: 100) {
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
`;

const ACTIVE_POWERUPS_QUERY = gql`
  query ActivePowerupsQuery {
    activePowerupConnection {
      nodes {
        id
        powerup {
          id
          name
        }
      }
    }
  }
`;

const TYPE_ORDER = ["redeemable", "emote"];
const ORDER_FN = ({ type }) => {
  const order = TYPE_ORDER.indexOf(type);
  return order === -1 ? 9999 : order;
};

export default function Collectibles(props) {
  const { $emptyState } = props;

  const enqueueSnackBar = useSnackBar();
  const { pushPage, popPage } = usePageStack();

  // collectibles
  const [
    {
      data: collectibleConnectionData,
      fetching: isFetchingCollectibles,
      error: collectibleFetchError,
    },
  ] = useQuery({
    query: COLLECTIBLE_GET_ALL_BY_ME_QUERY,
  });

  const collectibleConnection = collectibleConnectionData?.collectibleConnection;

  const sortedCollectibles = _.orderBy(
    collectibleConnection?.nodes,
    (collectible) => collectible.ownedCollectible?.count,
  );
  const groups = _.groupBy(sortedCollectibles, "type");
  const groupedCollectibles = _.orderBy(
    _.map(groups, (collectibles, type) => {
      return { type, collectibles };
    }),
    ORDER_FN,
  );
  const isEmpty = _.isEmpty(collectibleConnection?.nodes);

  // active powerups
  const [{ data: activePowerupData }] = useQuery({
    query: ACTIVE_POWERUPS_QUERY,
  });

  const activePowerups = activePowerupData?.activePowerupConnection?.nodes ?? [];

  if (isEmpty) return "Looks like you don't have any collectibles!";

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
