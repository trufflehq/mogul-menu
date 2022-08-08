import { React } from "../../../deps.ts";
import { ActivatePowerupDialog } from "../activate-powerup-dialog/activate-powerup-dialog.tsx";

export default function UsernameGradientDialog({ redeemableCollectible }) {
  return (
    <ActivatePowerupDialog redeemableCollectible={redeemableCollectible}>
      Select your gradient
    </ActivatePowerupDialog>
  );
}

// export function UserNameGradientDialog(props) {
//   const {
//     redeemableCollectible,
//     headerText,
//     primaryText,
//     secondaryText,
//     highlightBg,
//     $title,
//     onExit,
//   } = props;

//   const { selectedGradientStream, gradientStream } = useMemo(() => {
//     return {
//       selectedGradientStream: createSubject(null),
//       gradientStream: createSubject(
//         redeemableCollectible.source?.data?.redeemData?.colors
//       ),
//     };
//   }, []);

//   const { gradients, selectedGradient } = useObservables(() => ({
//     gradients: gradientStream.obs,
//     selectedGradient: selectedGradientStream.obs,
//   }));

//   return (
//     <RedeemDialogSelectable
//       redeemableCollectible={redeemableCollectible}
//       onExit={onExit}
//       $dropdown={
//         <UsernameGradientDropdown
//           selectedGradientStream={selectedGradientStream}
//           gradientStream={gradientStream}
//         />
//       }
//       getAdditionalData={() => {
//         const selectedGradientValue =
//           _.find(gradients, { name: selectedGradient })?.value ||
//           "var(--mm-color-bg-secondary)";

//         const additionalData = {
//           value: selectedGradientValue,
//         };

//         return additionalData;
//       }}
//       headerText={headerText}
//       primaryText={primaryText}
//       secondaryText={secondaryText}
//       highlightBg={highlightBg}
//       $title={$title}
//       isActiveButtonDisabledStream={createSubject(
//         selectedGradientStream.obs.pipe(
//           op.map((selectedGradient) => !selectedGradient)
//         )
//       )}
//     />
//   );
// }
