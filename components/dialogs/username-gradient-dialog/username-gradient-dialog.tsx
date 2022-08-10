import { React, useState, useStyleSheet } from "../../../deps.ts";
import Select from "../../base/select/select.tsx";
import Option from "../../base/option/option.tsx";
import { ActivatePowerupDialog } from "../activate-powerup-dialog/activate-powerup-dialog.tsx";
import styleSheet from "./username-gradient-dialog.scss.js";
import ColorOption from "../../base/color-option/color-option.tsx";

export default function UsernameGradientDialog({ redeemableCollectible }) {
  useStyleSheet(styleSheet);

  const gradients = redeemableCollectible?.source?.data?.redeemData?.colors;
  const [selectedValue, setSelectedValue] = useState();
  const additionalData = { value: selectedValue };

  const selectChangeHandler = (value, _idx) => {
    setSelectedValue(value);
  };

  return (
    <ActivatePowerupDialog
      redeemableCollectible={redeemableCollectible}
      additionalData={additionalData}
      isActivateButtonDisabled={!selectedValue}
    >
      <div className="c-username-gradient-body">
        <Select onOptionChanged={selectChangeHandler}>
          <ColorOption disabled defaultOption>
            Select a gradient
          </ColorOption>
          {gradients?.map((gradient) => (
            <ColorOption value={gradient.value} color={gradient.value}>
              {gradient.name}
            </ColorOption>
          ))}
        </Select>
      </div>
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
