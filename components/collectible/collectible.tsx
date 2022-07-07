import React, { useState } from "https://npm.tfl.dev/react";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";

import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";
import Dialog from "https://tfl.dev/@truffle/ui@0.0.2/components/dialog/dialog.entry.js";
import RedeemableDialog from "../redeemable-dialog/redeemable-dialog.tsx";

export default function Collctible(props) {
  const {
    collectible,
    activePowerup,
    sizePx = 60,
    onViewCollection,
    enqueueSnackBar,
    pushPage,
    popPage,
  } = props;

  const isOwned = collectible?.ownedCollectible?.count || activePowerup;

  const imageUrl = getModel().image.getSrcByImageObj(
    collectible?.fileRel?.fileObj
  );
  const canRedeem =
    collectible.type === "redeemable" &&
    ["user", "none"].includes(collectible.targetType);

  const [isDialogHidden, setDialogHidden] = useState(true);

  const onRedeemHandler = () => {
    setDialogHidden(false);
  };

  return (
    <ScopedStylesheet url={new URL("collectible.css", import.meta.url)}>
      <div className={`c-collectible ${classKebab({ isOwned })}`}>
        <Dialog hidden={isDialogHidden}>
          <RedeemableDialog
            primaryText={collectible.name}
            redeemableCollectible={{ source: collectible }}
            onViewCollection={onViewCollection}
            onExit={() => setDialogHidden(true)}
          />
        </Dialog>
        <div
          className="image"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "100%",
            width: `${sizePx}px`,
            height: `${sizePx}px`,
          }}
        />
        {collectible?.name && (
          <div className="info">
            <div className="name">{collectible?.name}</div>
            {collectible?.ownedCollectible?.count ? (
              <div className="count">
                {`x${collectible?.ownedCollectible?.count}`}
              </div>
            ) : null}
          </div>
        )}
        {isOwned && canRedeem && (
          <div
            className={`button ${classKebab({
              isActive: Boolean(activePowerup),
            })}`}
          >
            <Button
              text={
                activePowerup
                  ? "Active"
                  : collectible?.data?.redeemButtonText ?? "Redeem"
                // lang.get("collectible.redeem"),
              }
              onClick={onRedeemHandler}
              shouldHandleLoading={true}
              bg="var(--truffle-color-bg-tertiary)"
              textColor="var(--truffle-color-text-bg-tertiary)"
              borderRadius="4px"
            />
          </div>
        )}
      </div>
    </ScopedStylesheet>
  );
}
