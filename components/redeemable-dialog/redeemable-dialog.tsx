import React, { useMemo } from "https://npm.tfl.dev/react";
import {
  createSubject,
  Obs,
  op,
} from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";
import _ from "https://npm.tfl.dev/lodash?no-check";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import {
  useMutation,
  queryObservable,
  gql,
} from "https://tfl.dev/@truffle/api@0.0.1/client.js";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js";

import ItemDialog from "../item-dialog/item-dialog.tsx";
import SnackBar from "https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar/snack-bar.js";
import Avatar from "https://tfl.dev/@truffle/ui@0.0.1/components/avatar/avatar.js";
import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.js";
import Dropdown from "https://tfl.dev/@truffle/ui@0.0.2/components/dropdown/dropdown.js";
import { fromNow } from "../../util/general.ts";

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

const DELETE_ACTIVE_POWERUP_MUTATION = gql`
  mutation DeleteActivePowerupById($powerupId: ID!) {
    activePowerupDeleteById(input: { id: $powerupId }) {
      activePowerup {
        id
      }
    }
  }
`;

export default function RedeemableDialog(props) {
  const {
    redeemableCollectible,
    $children,
    $title,
    onViewCollection,
    headerText,
    primaryText,
    secondaryText,
    highlightBg,
    onExit,
  } = props;

  const redeemablePowerupId =
    redeemableCollectible?.source?.data?.redeemData?.powerupId;

  const { activePowerupObs, activePowerupsObs, collectiblesObs } =
    useMemo(() => {
      const orgUserActivePowerupConnectionObs = queryObservable(
        ACTIVE_POWERUPS_QUERY
      );

      const activePowerupsObs = orgUserActivePowerupConnectionObs.pipe(
        op.map(({ data }: any) => {
          return data?.activePowerupConnection?.nodes ?? [];
        })
      );
      return {
        activePowerupsObs,
        // model.collectible.getAllByMe()
        collectiblesObs: Obs.from([{ nodes: [] }]).pipe(
          op.map((collectibleConnection) => {
            return collectibleConnection?.nodes;
          })
        ),
        activePowerupObs: activePowerupsObs.pipe(
          op.map((activePowerups) =>
            _.find(activePowerups, {
              powerup: { id: redeemablePowerupId },
            })
          )
        ),
      };
    }, []);

  const { collectibles, activePowerup, activePowerups, org } = useObservables(
    () => ({
      collectibles: collectiblesObs,
      activePowerups: activePowerupsObs,
      activePowerup: activePowerupObs,
      // org: model.org.getMe(),
      org: Obs.from([{}]),
    })
  );

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

  if (!redeemableCollectible || !activePowerups) {
    return <></>;
  }

  let Component;
  if (activePowerup) {
    Component = ActiveRedeemableDialog;
  } else if (isOpenedCollectiblePack || isRedeemed) {
    Component = RedeemedCollectibleDialog;
  } else if (isChatHighlightPowerup) {
    Component = ChatHighlightDialog;
  } else if (isUsernameGradientPowerup) {
    Component = UserNameGradientDialog;
  } else if (isRecipe) {
    Component = RecipeDialog;
  } else {
    Component = UnlockedRedeemableDialog;
  }

  return (
    <Component
      $title={$title}
      headerText={headerText}
      highlightBg={highlightBg}
      redeemableCollectible={redeemableCollectible}
      collectiblesObs={collectiblesObs}
      activePowerup={activePowerup}
      org={org}
      onViewCollection={onViewCollection}
      primaryText={primaryText}
      secondaryText={secondaryText}
      $children={$children}
      onExit={onExit}
    />
  );
}

export function ActiveRedeemableDialog({
  $title,
  headerText,
  redeemableCollectible,
  activePowerup,
  org,
  highlightBg,
  onExit,
}) {
  const [_deleteResult, executeDeleteActivePowerupMutation] = useMutation(
    DELETE_ACTIVE_POWERUP_MUTATION
  );

  const durationSeconds =
    redeemableCollectible.source?.data?.redeemData?.durationSeconds;

  const creationDate = new Date(activePowerup.creationDate);
  const expirationDate = new Date(
    creationDate.getTime() + durationSeconds * 1000
  );
  // TODO: fixme
  const timeRemaining = fromNow(expirationDate);

  const deleteActivePowerup = async () => {
    // if (confirm(lang.get("general.areYouSure"))) {
    if (confirm("Are you sure?")) {
      await executeDeleteActivePowerupMutation({ powerupId: activePowerup.id });
      onExit?.();
      // browserComms.call("user.invalidateSporeUser", { orgId: org?.id });
      // browserComms.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
    }
  };
  return (
    <div className="z-unlocked-emote-reward-dialog use-css-vars-creator">
      <ItemDialog
        displayMode="center"
        imgRel={redeemableCollectible?.source?.fileRel}
        $title={$title}
        highlightBg={highlightBg}
        headerText={headerText}
        primaryText={`${redeemableCollectible?.source?.name ?? ""} is active`}
        secondaryText={`${timeRemaining ?? ""} left`}
        secondaryTextStyle="alert"
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: "var(--truffle-color-bg-tertiary)",
            textColor: "var(--truffle-color-text-bg-tertiary)",
            onClick: onExit,
          },
          {
            text: "Delete",
            borderRadius: "4px",
            style: "primary",
            bg: "#ED6565",
            bgColor: "#ED6565",
            textColor: "var(--truffle-color-bg-primary)",
            shouldHandleLoading: true,
            onClick: deleteActivePowerup,
          },
        ]}
        onExit={onExit}
      />
    </div>
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
            bg: "var(--truffle-color-bg-tertiary)",
            textColor: "var(--truffle-color-text-bg-tertiary)",
            onClick: onExit,
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
}

function ColorDropdown(props) {
  const { selectedColorStream, colorsStream } = props;

  const { selectedColor, colors } = useObservables(() => ({
    selectedColor: selectedColorStream.obs,
    colors: colorsStream.obs,
  }));

  const selectedColorRgba =
    _.find(colors, { name: selectedColor })?.rgba ||
    "var(--truffle-color-bg-primary)";

  return (
    <div className="c-color-dropdown">
      <Dropdown
        valueSubject={selectedColorStream}
        options={colors.map((option: any) => ({
          value: option.name,
          name: option.name,
        }))}
      />
      {/* <Component
        slug="dropdown"
        props={{
          isFullWidth: true,
          label: "Highlight color", // TODO - move this to the collectible data
          valueStream: selectedColorStream,
          placeholder: "Select a color",
          useCssVarsCreator: true,
          $current: (
            <div className="current">
              <div className="wrapper">
                <Component
                  slug="icon"
                  props={{
                    icon: CIRCLE_ICON_PATH,
                    color: selectedColorRgba,
                    hasRipple: true,
                    size: "24px",
                    iconViewBox: "24px",
                  }}
                />
              </div>
              <div className="name">{selectedColor || "Select a color"}</div>
              <div className="chevron">
                <Component
                  slug="icon"
                  props={{
                    icon: "chevronDown",
                    color: "var(--truffle-color-text-bg-primary)",
                  }}
                />
              </div>
            </div>
          ),
          options: _.map(colors, (option) => ({
            value: option.name,
            icon: CIRCLE_ICON_PATH,
            iconColor: option.rgba,
            anchor: "bottom-left",
            text: option.name,
            onSelect: () => {
              selectedColorStream.next(option.name);
            },
          })),
        }}
      /> */}
    </div>
  );
}

function UsernameGradientDropdown(props) {
  const { selectedGradientStream, gradientStream } = props;

  const { selectedGradient, gradients, user } = useObservables(() => ({
    selectedGradient: selectedGradientStream.obs,
    gradients: gradientStream.obs,
    // user: model.user.getMe(),
    user: Obs.from([{}]),
  }));

  const selectedGradientBg =
    _.find(gradients, { name: selectedGradient })?.value ||
    "var(--truffle-color-bg-primary)";

  return (
    <div className="c-gradient-dropdown">
      <Dropdown
        valueSubject={selectedGradientStream}
        options={gradients.map((option: any) => ({
          value: option.name,
          name: option.name,
        }))}
      />
      {/* <Component
        slug="dropdown"
        props={{
          isFullWidth: true,
          label: "Username gradient", // TODO - move this to the collectible data
          valueStream: selectedGradientStream,
          placeholder: "Select a gradient",
          useCssVarsCreator: true,
          $current: (
            <div className="current">
              <div
                className="circle"
                style={{ background: selectedGradientBg }}
              ></div>
              <div
                className={`name ${classKebab({
                  selected: !!selectedGradient,
                })}`}
                style={
                  selectedGradient ? { background: selectedGradientBg } : {}
                }
              >
                {selectedGradient ? user?.name : "Select a gradient"}
              </div>
              <div className="chevron">
                <Component
                  slug="icon"
                  props={{
                    icon: "chevronDown",
                    color: "var(--truffle-color-text-bg-primary)",
                  }}
                />
              </div>
            </div>
          ),
          options: _.map(gradients, (option) => ({
            value: option.name,
            anchor: "bottom-left",
            text: (
              <div className="gradient-option">
                <div className="circle" style={{ background: option.value }} />
                <div className="text" style={{ background: option.value }}>
                  {user?.name ?? option.name}
                </div>
              </div>
            ),
            onSelect: () => {
              selectedGradientStream.next(option.name);
            },
          })),
        }}
      /> */}
    </div>
  );
}

export function RedeemDialogSelectable(props) {
  const {
    redeemableCollectible,
    $dropdown,
    getAdditionalData,
    errorStream,
    isActiveButtonDisabledStream,
    headerText,
    primaryText,
    secondaryText,
    highlightBg,
    $title,
    onExit,
  } = props;

  const { org } = useObservables(() => ({
    // org: model.org.getMe(),
    org: Obs.from([{}]),
  }));

  const collectible = redeemableCollectible?.source;
  const enqueueSnackBar = useSnackBar();
  const [_redeemResult, executeRedeemMutation] = useMutation(
    REDEEM_COLLECTIBLE_MUTATION
  );

  const redeemHandler = async () => {
    try {
      const additionalData = getAdditionalData();

      const { data: result, error } = await executeRedeemMutation({
        collectibleId: collectible.id,
        additionalData,
      });

      const { redeemResponse } = result.ownedCollectibleRedeem;
      const { redeemError } = result.ownedCollectibleRedeem;

      if (error) {
        errorStream.next(
          "There was an internal error while redeeming; check the logs"
        );
        console.error("Error while redeeming:", error);
      } else if (redeemError) {
        errorStream.next(
          `There was an error redeeming ${redeemError?.message}`
        );
      } else {
        onExit?.();
        enqueueSnackBar(() => (
          <PowerupActivatedSnackBar collectible={collectible} />
        ));
      }

      // browserComms.call("user.invalidateSporeUser", { orgId: org?.id });
      // browserComms.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
    } catch (err) {
      console.log("err", err);
      alert("There was an error redeeming: " + err?.info || err?.message);
      errorStream.next(
        `There was an error redeeming ${err?.info || err?.message}`
      );
    }
  };

  return (
    <div className="z-redeem-dialog-selectable use-css-vars-creator">
      <ItemDialog
        displayMode="center"
        imgRel={redeemableCollectible?.source?.fileRel}
        $controls={$dropdown}
        headerText={headerText}
        $title={$title}
        highlightBg={highlightBg}
        errorStream={errorStream}
        primaryText={
          primaryText ?? `${redeemableCollectible?.source?.name} unlocked`
        }
        secondaryText={
          secondaryText ??
          redeemableCollectible?.description ??
          redeemableCollectible?.source?.data?.description
        }
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: "var(--truffle-color-bg-tertiary)",
            textColor: "var(--truffle-color-text-bg-tertiary)",
            onClick: onExit,
          },
          {
            text: "Activate",
            borderRadius: "4px",
            style: "primary",
            bg: highlightBg ?? "var(--truffle-color-primary)",
            bgColor: highlightBg ?? "var(--truffle-color-primary)",
            textColor: "var(--truffle-color-bg-primary)",
            onClick: redeemHandler,
            isDisabledStream: isActiveButtonDisabledStream,
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
}

export function ChatHighlightDialog(props) {
  const {
    redeemableCollectible,
    headerText,
    primaryText,
    secondaryText,
    highlightBg,
    $title,
    onExit,
  } = props;

  const { selectedColorStream, colorsStream } = useMemo(() => {
    return {
      selectedColorStream: createSubject(null),
      colorsStream: createSubject(
        redeemableCollectible.source?.data?.redeemData?.colors
      ),
    };
  }, []);

  const { colors, selectedColor } = useObservables(() => ({
    colors: colorsStream.obs,
    selectedColor: selectedColorStream.obs,
  }));

  return (
    <RedeemDialogSelectable
      redeemableCollectible={redeemableCollectible}
      onExit={onExit}
      $dropdown={
        <ColorDropdown
          selectedColorStream={selectedColorStream}
          colorsStream={colorsStream}
        />
      }
      getAdditionalData={() => {
        const selectedColorRgba =
          _.find(colors, { name: selectedColor })?.rgba ||
          "var(--truffle-color-bg-primary)";

        const additionalData = {
          rgba: selectedColorRgba,
        };

        return additionalData;
      }}
      headerText={headerText}
      primaryText={primaryText}
      secondaryText={secondaryText}
      highlightBg={highlightBg}
      $title={$title}
      isActiveButtonDisabledStream={createSubject(
        selectedColorStream.obs.pipe(op.map((selectedColor) => !selectedColor))
      )}
    />
  );
}

export function UserNameGradientDialog(props) {
  const {
    redeemableCollectible,
    headerText,
    primaryText,
    secondaryText,
    highlightBg,
    $title,
    onExit,
  } = props;

  const { selectedGradientStream, gradientStream } = useMemo(() => {
    return {
      selectedGradientStream: createSubject(null),
      gradientStream: createSubject(
        redeemableCollectible.source?.data?.redeemData?.colors
      ),
    };
  }, []);

  const { gradients, selectedGradient } = useObservables(() => ({
    gradients: gradientStream.obs,
    selectedGradient: selectedGradientStream.obs,
  }));

  return (
    <RedeemDialogSelectable
      redeemableCollectible={redeemableCollectible}
      onExit={onExit}
      $dropdown={
        <UsernameGradientDropdown
          selectedGradientStream={selectedGradientStream}
          gradientStream={gradientStream}
        />
      }
      getAdditionalData={() => {
        const selectedGradientValue =
          _.find(gradients, { name: selectedGradient })?.value ||
          "var(--truffle-color-bg-primary)";

        const additionalData = {
          value: selectedGradientValue,
        };

        return additionalData;
      }}
      headerText={headerText}
      primaryText={primaryText}
      secondaryText={secondaryText}
      highlightBg={highlightBg}
      $title={$title}
      isActiveButtonDisabledStream={createSubject(
        selectedGradientStream.obs.pipe(
          op.map((selectedGradient) => !selectedGradient)
        )
      )}
    />
  );
}

export function UnlockedRedeemableDialog(props) {
  const {
    redeemableCollectible,
    $children,
    collectiblesObs,
    onViewCollection,
    headerText,
    primaryText,
    secondaryText,
    highlightBg,
    $title,
    onExit,
  } = props;

  // rm this if we're not invalidating cache using jumper
  const { org } = useObservables(() => ({
    // org: model.org.getMe(),
    org: Obs.from([{}]),
  }));

  const isCollectiblePack =
    redeemableCollectible?.source?.data?.redeemType === "collectiblePack";
  const collectible = redeemableCollectible?.source;
  const enqueueSnackBar = useSnackBar();
  const [_redeemResult, executeRedeemMutation] = useMutation(
    REDEEM_COLLECTIBLE_MUTATION
  );

  const redeemHandler = async () => {
    try {
      const additionalData = {};
      if (collectible.data.redeemType === "alertCustomMessage") {
        additionalData.message = prompt("Enter custom message for the overlay");
        if (!additionalData.message) {
          alert("Must enter a message");
          return;
        }
      }

      const { data: result, error } = await executeRedeemMutation({
        collectibleId: collectible.id,
        additionalData,
      });

      const { redeemResponse } = result.ownedCollectibleRedeem;
      const { redeemError } = result.ownedCollectibleRedeem;

      if (error) {
        alert("There was an internal error while redeeming; check the logs");
        console.error("Error while redeeming:", error);
      } else if (redeemError) {
        alert("There was an error redeeming: " + redeemError?.message);
      } else if (redeemResponse.type === "collectiblePack") {
        onExit?.();
        // TODO: figure out a better solution for dialogs
        // before adding this back in
        // overlay.open(CollectibleItemDialog, {
        //   ...redeemResponse,
        //   collectiblesObs,
        //   onViewCollection,
        // });
      } else {
        onExit?.();
        enqueueSnackBar(() => (
          <PowerupActivatedSnackBar collectible={collectible} />
        ));
      }

      // browserComms.call("user.invalidateSporeUser", { orgId: org?.id });
      // browserComms.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
    } catch (err) {
      console.log("err", err);
      alert("There was an error redeeming: " + err?.info || err?.message);
    }
  };

  return (
    <div className="z-unlocked-emote-reward-dialog use-css-vars-creator">
      <ItemDialog
        displayMode="center"
        imgRel={redeemableCollectible?.source?.fileRel}
        $children={$children}
        headerText={headerText}
        $title={$title}
        highlightBg={highlightBg}
        primaryText={
          primaryText ?? `${redeemableCollectible?.source?.name} unlocked`
        }
        secondaryText={
          secondaryText ??
          redeemableCollectible?.description ??
          redeemableCollectible?.source?.data?.description
        }
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: "var(--truffle-color-bg-tertiary)",
            textColor: "var(--truffle-color-text-bg-tertiary)",
            onClick: onExit,
          },
          {
            text: isCollectiblePack ? "Open" : "Activate",
            borderRadius: "4px",
            style: "primary",
            bg: highlightBg ?? "var(--truffle-color-primary)",
            bgColor: highlightBg ?? "var(--truffle-color-primary)",
            textColor: "var(--truffle-color-text-primary)",
            onClick: redeemHandler,
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
}

function CollectibleItemDialog({
  collectibleIds,
  collectiblesObs,
  onViewCollection,
  onExit,
}) {
  const { packCollectibles } = useObservables(() => ({
    packCollectibles: collectiblesObs.pipe(
      op.map((collectibles) =>
        _.filter(collectibles, (collectible) =>
          collectibleIds.includes(collectible?.id)
        )
      )
    ),
  }));

  const redeemedCollectible = packCollectibles?.[0];

  if (!redeemedCollectible) {
    return <></>;
  }
  return (
    <div className="z-collectible-pack-dialog">
      <ItemDialog
        displayMode="center"
        imgRel={redeemedCollectible?.fileRel}
        primaryText={`You opened a ${redeemedCollectible?.name} emote`}
        secondaryText="Try using the emote in chat!"
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: "var(--truffle-color-bg-tertiary)",
            textColor: "var(--truffle-color-text-bg-tertiary)",
            onClick: onExit,
          },
          {
            text: "View collection",
            borderRadius: "4px",
            style: "primary",
            onClick: onViewCollection,
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
}

function PowerupActivatedSnackBar({ collectible }) {
  const { me } = useObservables(() => ({
    // me: model.user.getMe(),
    me: Obs.of([{}]),
  }));
  const powerupSrc = getModel().image.getSrcByImageObj(
    collectible?.fileRel?.fileObj
  );

  return (
    <SnackBar
      message={collectible?.name ? `${collectible?.name} activated!` : ""}
      style="flat"
      value={
        <>
          <Avatar user={me} size="24px" />
          <ImageByAspectRatio
            imageUrl={powerupSrc}
            aspectRatio={collectible?.fileRel?.fileObj?.data?.aspectRatio ?? 1}
            widthPx={24}
            height={24}
          />
        </>
      }
    />
  );
}

export function RecipeDialog(props) {
  const {
    redeemableCollectible,
    headerText,
    primaryText,
    secondaryText,
    highlightBg,
    $title,
    onViewCollection,
    onExit,
  } = props;

  const { errorStream } = useMemo(() => {
    return {
      selectedColorStream: createSubject(null),
      colorsStream: createSubject(
        redeemableCollectible.source?.data?.redeemData?.colors
      ),
      errorStream: createSubject(""),
    };
  }, []);

  const openCraftTable = () => {
    // overlay.close();
    // pushPage(() => (
    //   <Component
    //     slug="browser-extension-menu-crafting-table"
    //     props={{
    //       redeemableCollectible: redeemableCollectible,
    //       popPage: popPage,
    //       onViewCollection: onViewCollection,
    //       enqueueSnackBar: enqueueSnackBar,
    //     }}
    //   />
    // ));
  };

  return (
    <div className="z-recipe-dialog use-css-vars-creator">
      <ItemDialog
        displayMode="center"
        imgRel={redeemableCollectible?.source?.fileRel}
        headerText={headerText}
        $title={$title}
        highlightBg={highlightBg}
        errorStream={errorStream}
        primaryText={
          primaryText ?? `${redeemableCollectible?.source?.name} unlocked`
        }
        secondaryText={
          secondaryText ??
          redeemableCollectible?.description ??
          redeemableCollectible?.source?.data?.description
        }
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: "var(--truffle-color-bg-tertiary)",
            textColor: "var(--truffle-color-text-bg-tertiary)",
            onClick: onExit,
          },
          {
            text: "Craft an emote",
            borderRadius: "4px",
            style: "primary",
            bg: highlightBg ?? "var(--truffle-color-primary)",
            bgColor: highlightBg ?? "var(--truffle-color-primary)",
            textColor: "var(--truffle-color-text-primary)",
            onClick: openCraftTable,
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
}
