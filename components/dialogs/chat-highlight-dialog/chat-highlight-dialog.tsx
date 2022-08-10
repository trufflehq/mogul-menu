import { React, useState, useStyleSheet } from "../../../deps.ts";
import ColorOption from "../../base/color-option/color-option.tsx";
import Select from "../../base/select/select.tsx";
import { ActivatePowerupDialog } from "../activate-powerup-dialog/activate-powerup-dialog.tsx";
import styleSheet from "./chat-highlight-dialog.scss.js";

export default function ChatHighlightDialog({ redeemableCollectible }) {
  useStyleSheet(styleSheet);

  const colors = redeemableCollectible?.source?.data?.redeemData?.colors;
  const [selectedValue, setSelectedValue] = useState();
  const additionalData = { rgba: selectedValue };

  const selectChangeHandler = (value, _idx) => {
    setSelectedValue(value);
  };

  return (
    <ActivatePowerupDialog
      redeemableCollectible={redeemableCollectible}
      additionalData={additionalData}
      isActivateButtonDisabled={!selectedValue}
    >
      <div className="c-chat-highlight-dialog-body">
        <Select onOptionChanged={selectChangeHandler}>
          <ColorOption disabled defaultOption>
            Select a color
          </ColorOption>
          {colors?.map((color) => (
            <ColorOption value={color.rgba} color={color.rgba}>
              {color.name}
            </ColorOption>
          ))}
        </Select>
      </div>
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
