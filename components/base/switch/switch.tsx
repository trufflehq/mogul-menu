import { React, useState, useStyleSheet } from "../../../deps.ts";
import styleSheet from "./switch.scss.js";

export default function Switch({
  value,
  onChange = () => null,
  label,
}: {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
}) {
  useStyleSheet(styleSheet);

  const [currentState, setCurrentState] = useState(false);
  const changeHandler = () => {
    const newVal = value === undefined ? !currentState : !value;
    setCurrentState(newVal);
    onChange?.(newVal);
  };

  return (
    <label className="c-switch">
      {label && <div className="label">{label}</div>}
      <input
        type="checkbox"
        checked={value ?? currentState}
        onChange={changeHandler}
      />
      <span className="slider round"></span>
    </label>
  );
}
