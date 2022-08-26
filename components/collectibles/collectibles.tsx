import { _, gql, React, useMemo, useQuery, useStyleSheet } from "../../deps.ts";

import Collectible from "../collectible/collectible.tsx";
import { usePageStack } from "../../state/mod.ts";

import styleSheet from "./collectibles.scss.js";
import { useCurrentTab, useSnackBar } from "../../state/mod.ts";
import { Collectible as CollectibleType } from "../../types/collectible.types.ts";
import { useCollectibleConnection } from "../../util/mod.ts";
import { ActivePowerup } from "../../types/active-powerup.types.ts";
import Button from "../base/button/button.tsx";
import LinkButton from "../base/link-button/link-button.tsx";
import ChannelPointsIcon from "../channel-points-icon/channel-points-icon.tsx";
import XPIcon from "../xp-icon/xp-icon.tsx";
import XpActionsDialog from "../dialogs/xp-actions-dialog/xp-actions-dialog.tsx";
import { useDialog } from "../base/dialog-container/dialog-service.ts";
import ChannelPointsActionsDialog from "../dialogs/channel-points-actions-dialog/channel-points-actions-dialog.tsx";

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

export default function Collectibles() {
  useStyleSheet(styleSheet);

  const enqueueSnackBar = useSnackBar();
  const { pushPage, popPage } = usePageStack();

  // collectibles
  const { collectibleConnectionData, isFetchingCollectibles, collectibleFetchError } =
    useCollectibleConnection();

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

  // active powerups
  const [{ data: activePowerupData }] = useQuery({
    query: ACTIVE_POWERUPS_QUERY,
  });

  const activePowerups = activePowerupData?.activePowerupConnection?.nodes ?? [];

  const isEmpty = groupedCollectibles.every((group) =>
    group.collectibles?.every(
      (collectible) => !shouldShowCollectible(activePowerups, collectible),
    )
  );

  if (isEmpty) return <NoCollectiblesPlaceholder />;

  return (
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
                  shouldShowCollectible(activePowerups, collectible) && (
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
  );
}

function shouldShowCollectible(
  activePowerups: ActivePowerup[],
  collectible: CollectibleType<any>,
) {
  const powerupId = collectible?.data?.redeemData?.powerupId;
  const activePowerup = _.find(activePowerups, {
    powerup: { id: powerupId },
  });

  return collectible?.ownedCollectible?.count > 0 || activePowerup;
}

function NoCollectiblesPlaceholder() {
  return (
    <div className="c-no-collectibles-placeholder">
      <NoCollectibles />
      <EarnCollectibles />
    </div>
  );
}

function NoCollectibles() {
  return (
    <div className="c-no-collectibles">
      <img
        src="https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/2x"
        width="60"
      />
      <div className="mm-text-subtitle-1">Nothing in your collection, yet!</div>
    </div>
  );
}

function EarnCollectibles() {
  const { setActiveTab } = useCurrentTab();
  const { pushDialog } = useDialog();

  return (
    <div className="c-earn-collectibles">
      <div className="heading mm-text-header-caps">Start earning</div>
      <WayToEarn
        icon={<XPIcon />}
        description="Earn XP to unlock rewards in the Battle pass"
        button={
          <Button onClick={() => setActiveTab("battle-pass")} style="primary">
            Go to Battle pass
          </Button>
        }
        oucLink={
          <LinkButton onClick={() => pushDialog(<XpActionsDialog />)}>
            How do I earn XP?
          </LinkButton>
        }
      />
      <WayToEarn
        icon={<ChannelPointsIcon />}
        description="Earn channel points to buy items in the shop"
        button={
          <Button onClick={() => setActiveTab("shop")} style="primary">
            Go to Shop
          </Button>
        }
        oucLink={
          <LinkButton
            onClick={() => pushDialog(<ChannelPointsActionsDialog />)}
          >
            How do I earn channel points?
          </LinkButton>
        }
      />
    </div>
  );
}

function WayToEarn({
  description,
  icon,
  button,
  oucLink,
}: {
  description: string;
  icon: React.ReactNode;
  button: React.ReactNode;
  oucLink: React.ReactNode;
}) {
  return (
    <div className="c-way-to-earn-collectibles">
      <div className="left">
        <div className="icon">{icon}</div>
      </div>
      <div className="right">
        <div className="description mm-text-body-1">{description}</div>
        <div className="button">{button}</div>
        <div className="ouc-link">{oucLink}</div>
      </div>
    </div>
  );
}
