import { React, gql, useQuery, _ } from "../../../deps.ts";

import ItemDialog from "../item-dialog/item-dialog.tsx";
import { useDialog } from "../../base/dialog-container/dialog-service.ts";
import { ActiveRedeemableDialog } from "../active-powerup-status-dialog/active-powerup-status-dialog.tsx";
import OpenCollectiblePackDialog from "../open-collectible-pack-dialog/open-collectible-pack-dialog.tsx";
import { ActivatePowerupDialog } from "../activate-powerup-dialog/activate-powerup-dialog.tsx";
import ChatHighlightDialog from "../chat-highlight-dialog/chat-highlight-dialog.tsx";
import UsernameGradientDialog from "../username-gradient-dialog/username-gradient-dialog.tsx";
import RecipeDialog from "../recipe-dialog/recipe-dialog.tsx";
import StreamAlertRedeemDialog from "../stream-alert-redeem-dialog/stream-alert-redeem-dialog.tsx";

const MESSAGE = {
  INVALIDATE_USER: "user.invalidate",
};

const CIRCLE_ICON_PATH = `M 0, 12
 a 12,12 0 1,1 24,0 
 a 12,12 0 1,1 -24,0`;

const REDEEM_COLLECTIBLE_MUTATION = gql`
  mutation OwnedCollectibleRedeem($collectibleId: ID!, $additionalData: JSON) {
    ownedCollectibleRedeem(
      input: { collectibleId: $collectibleId, additionalData: $additionalData }
    ) {
      redeemResponse
      redeemError
    }
  }
`;

const ACTIVE_POWERUPS_QUERY = gql`
  query ActivePowerupsQuery {
    activePowerupConnection {
      nodes {
        id
        creationDate
        powerup {
          id
          name
        }
      }
    }
  }
`;

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

export default function RedeemableDialog(props) {
  const {
    redeemableCollectible,
    $children,
    primaryText,
    secondaryText,
    highlightBg,
  } = props;

  const { popDialog: onExit } = useDialog();

  const redeemablePowerupId =
    redeemableCollectible?.source?.data?.redeemData?.powerupId;

  // active powerups
  const [{ data: activePowerupsData }] = useQuery({
    query: ACTIVE_POWERUPS_QUERY,
    // TODO: figure out why adding additionalTypes causes an infinite loop
    // context: { additionalTypenames: ["ActivePowerup"] },
  });
  const activePowerups = activePowerupsData?.activePowerupConnection?.nodes;
  const activePowerup = _.find(activePowerups ?? [], {
    powerup: { id: redeemablePowerupId },
  });

  // collectibles
  const [{ data: collectiblesData }] = useQuery({
    query: COLLECTIBLE_GET_ALL_BY_ME_QUERY,
    // TODO: figure out why adding additionalTypes causes an infinite loop
    // context: { additionalTypenames: "OwnedCollectible" },
  });
  const collectibles = collectiblesData?.collectibleConnection?.nodes;

  const isCollectiblePack =
    redeemableCollectible?.source?.data?.redeemType === "collectiblePack";
  const isOpenedCollectiblePack =
    isCollectiblePack &&
    _.find(collectibles, { id: redeemableCollectible.sourceId })
      ?.ownedCollectible?.count < 1;
  const isChatHighlightPowerup =
    redeemableCollectible?.source?.data?.redeemData?.category ===
    "chatMessageHighlight";
  const isUsernameGradientPowerup =
    redeemableCollectible?.source?.data?.redeemData?.category ===
    "chatUsernameGradient";
  const isRecipe = redeemableCollectible?.source?.data?.redeemType === "recipe";
  const isRedeemed = redeemableCollectible?.source?.ownedCollectible?.count < 1;
  const isStreamAlertCollectible =
    redeemableCollectible?.source?.data?.redeemType === "alertCustomMessage";

  if (!redeemableCollectible || !activePowerups) {
    return <></>;
  }

  let Component;
  if (activePowerup) {
    Component = ActiveRedeemableDialog;
  } else if (isStreamAlertCollectible) {
    Component = StreamAlertRedeemDialog;
  } else if (isCollectiblePack) {
    Component = OpenCollectiblePackDialog;
  } else if (isOpenedCollectiblePack || isRedeemed) {
    Component = RedeemedCollectibleDialog;
  } else if (isChatHighlightPowerup) {
    Component = ChatHighlightDialog;
  } else if (isUsernameGradientPowerup) {
    Component = UsernameGradientDialog;
  } else if (isRecipe) {
    Component = RecipeDialog;
  } else {
    Component = ActivatePowerupDialog;
  }

  return (
    <Component
      redeemableCollectible={redeemableCollectible}
      collectibles={collectibles}
      activePowerup={activePowerup}
      primaryText={primaryText}
      secondaryText={secondaryText}
      onExit={onExit}
    />
  );
}

export function RedeemedCollectibleDialog({
  $title,
  headerText,
  redeemableCollectible,
  highlightBg,
  onExit,
}) {
  return (
    <div className="z-unlocked-emote-reward-dialog use-css-vars-creator">
      <ItemDialog
        displayMode="center"
        imgRel={redeemableCollectible?.source?.fileRel}
        $title={$title}
        highlightBg={highlightBg}
        headerText={headerText}
        primaryText={`${
          redeemableCollectible?.source?.name ?? ""
        } has already been redeemed`}
        secondaryTextStyle=""
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: "var(--mm-color-bg-tertiary)",
            textColor: "var(--mm-color-text-bg-primary)",
            onClick: onExit,
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
}
