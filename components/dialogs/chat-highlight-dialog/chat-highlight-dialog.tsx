import { React } from "../../../deps.ts";
import { ActivatePowerupDialog } from "../activate-powerup-dialog/activate-powerup-dialog.tsx";

export default function ChatHighlightDialog({ redeemableCollectible }) {
  return (
    <ActivatePowerupDialog redeemableCollectible={redeemableCollectible}>
      Select your color
    </ActivatePowerupDialog>
  );
}

// export function ChatHighlightDialog(props) {
//   const {
//     redeemableCollectible,
//     headerText,
//     primaryText,
//     secondaryText,
//     highlightBg,
//     $title,
//     onExit,
//   } = props;

//   const { selectedColorStream, colorsStream } = useMemo(() => {
//     return {
//       selectedColorStream: createSubject(null),
//       colorsStream: createSubject(
//         redeemableCollectible.source?.data?.redeemData?.colors
//       ),
//     };
//   }, []);

//   const { colors, selectedColor } = useObservables(() => ({
//     colors: colorsStream.obs,
//     selectedColor: selectedColorStream.obs,
//   }));

//   return (
//     <RedeemDialogSelectable
//       redeemableCollectible={redeemableCollectible}
//       onExit={onExit}
//       $dropdown={
//         <ColorDropdown
//           selectedColorStream={selectedColorStream}
//           colorsStream={colorsStream}
//         />
//       }
//       getAdditionalData={() => {
//         const selectedColorRgba =
//           _.find(colors, { name: selectedColor })?.rgba ||
//           "var(--mm-color-bg-secondary)";

//         const additionalData = {
//           rgba: selectedColorRgba,
//         };

//         return additionalData;
//       }}
//       headerText={headerText}
//       primaryText={primaryText}
//       secondaryText={secondaryText}
//       highlightBg={highlightBg}
//       $title={$title}
//       isActiveButtonDisabledStream={createSubject(
//         selectedColorStream.obs.pipe(op.map((selectedColor) => !selectedColor))
//       )}
//     />
//   );
// }
