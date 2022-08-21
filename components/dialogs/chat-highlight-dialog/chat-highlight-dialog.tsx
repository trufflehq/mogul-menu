import { React, useState, useStyleSheet } from "../../../deps.ts";
import ColorOption from "../../base/color-option/color-option.tsx";
import { Collectible, ChatHighlightRedeemData } from '../../../types/mod.ts'
import Select from "../../base/select/select.tsx";
import { ActivatePowerupDialog } from "../activate-powerup-dialog/activate-powerup-dialog.tsx";
import styleSheet from "./chat-highlight-dialog.scss.js";

export default function ChatHighlightDialog({ redeemableCollectible }: { redeemableCollectible: { source: Collectible<ChatHighlightRedeemData>} }) {
  useStyleSheet(styleSheet);

  const colors = redeemableCollectible?.source?.data?.redeemData?.colors;
  const [selectedValue, setSelectedValue] = useState<string>();
  const additionalData = { rgba: selectedValue };

  const selectChangeHandler = (value: string, _idx: number) => {
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
