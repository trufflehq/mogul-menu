import { React, useState, useStyleSheet } from "../../../deps.ts";
import styleSheet from "./switch.scss.js";

export default function Switch({
  value = false,
  onChange = () => null,
}: {
  value?: boolean;
  onChange?: (value: boolean) => void;
}) {
  useStyleSheet(styleSheet);

  const [currentState, setCurrentState] = useState(value);
  const changeHandler = () => {
    const newVal = !currentState;
    setCurrentState(newVal);
    onChange?.(newVal);
  };

  return (
    <label class="c-switch">
      <input type="checkbox" checked={currentState} onChange={changeHandler} />
      <span class="slider round"></span>
    </label>
  );
}
