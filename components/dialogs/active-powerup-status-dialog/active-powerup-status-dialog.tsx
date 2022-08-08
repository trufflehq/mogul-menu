import { React, gql, useMutation } from "../../../deps.ts";
import { fromNow } from "../../../util/general.ts";
import Button from "../../base/button/button.tsx";
import { useDialog } from "../../base/dialog-container/dialog-service.ts";
import Dialog from "../../base/dialog/dialog.tsx";
import DefaultDialogContentFragment from "../content-fragments/default/default-dialog-content-fragment.tsx";

const DELETE_ACTIVE_POWERUP_MUTATION = gql`
  mutation DeleteActivePowerupById($powerupId: ID!) {
    activePowerupDeleteById(input: { id: $powerupId }) {
      activePowerup {
        id
      }
    }
  }
`;

export function ActiveRedeemableDialog({
  redeemableCollectible,
  activePowerup,
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
  const timeRemaining = fromNow(expirationDate);

  const { popDialog } = useDialog();

  const deleteActivePowerup = async () => {
    // if (confirm(lang.get("general.areYouSure"))) {
    if (confirm("Are you sure?")) {
      await executeDeleteActivePowerupMutation(
        { powerupId: activePowerup.id },
        { additionalTypenames: ["ActivePowerup"] }
      );
      // browserComms.call("user.invalidateSporeUser", { orgId: org?.id });
      // browserComms.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
    }
  };
  return (
    <Dialog
      actions={[
        <Button style="bg-tertiary" onClick={popDialog}>
          Close
        </Button>,
        <Button style="error" onClick={deleteActivePowerup}>
          Delete
        </Button>,
      ]}
    >
      <DefaultDialogContentFragment
        imageRel={redeemableCollectible?.source?.fileRel?.fileObj}
        primaryText={`${redeemableCollectible?.source?.name ?? ""} is active`}
        secondaryText={`${timeRemaining ?? ""} left`}
      />
    </Dialog>
  );
}
