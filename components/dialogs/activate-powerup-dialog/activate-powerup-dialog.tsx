import {
  React,
  useMutation,
  useObservables,
  gql,
  Obs,
  _,
} from "../../../deps.ts";
import { useDialog } from "../../base/dialog-container/dialog-service.ts";
import { useSnackBar } from "../../../util/snack-bar/snack-bar.ts";
import { PowerupActivatedSnackBar } from "../../snack-bars/powerup-activated-snack-bar/powerup-activated-snack-bar.tsx";
import Dialog from "../../base/dialog/dialog.tsx";
import Button from "../../base/button/button.tsx";
import DefaultDialogContentFragment from "../content-fragments/default/default-dialog-content-fragment.tsx";

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

export function ActivatePowerupDialog({
  redeemableCollectible,
  children,
  isActivateButtonDisabled = false,
  additionalData = {},
}: {
  redeemableCollectible: any;
  children?: any;
  isActivateButtonDisabled?: boolean;
  additionalData?: any;
}) {
  const { popDialog } = useDialog();

  // rm this if we're not invalidating cache using jumper
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
      const { data: result, error } = await executeRedeemMutation(
        {
          collectibleId: collectible.id,
          additionalData,
        },
        {
          additionalTypenames: ["OwnedCollectible", "ActivePowerup"],
        }
      );

      popDialog();

      const { redeemResponse } = result.ownedCollectibleRedeem;
      const { redeemError } = result.ownedCollectibleRedeem;

      if (error) {
        alert("There was an internal error while redeeming; check the logs");
        console.error("Error while redeeming:", error);
      } else if (redeemError) {
        alert("There was an error redeeming: " + redeemError?.message);
      } else {
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
    <Dialog
      actions={[
        <Button style="bg-tertiary" onClick={popDialog}>
          Close
        </Button>,
        <Button
          style="primary"
          isDisabled={isActivateButtonDisabled}
          onClick={redeemHandler}
        >
          Activate
        </Button>,
      ]}
    >
      <DefaultDialogContentFragment
        imageRel={redeemableCollectible?.source?.fileRel?.fileObj}
        primaryText={`${redeemableCollectible?.source?.name} unlocked`}
        secondaryText={
          redeemableCollectible?.description ??
          redeemableCollectible?.source?.data?.description
        }
      />
      {children}
    </Dialog>
  );
}