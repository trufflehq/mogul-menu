import React from "https://npm.tfl.dev/react";
import root from "https://npm.tfl.dev/react-shadow@19";
import Button from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/button/button.tsx";

export default function ActionBanner({
  onClick,
  message,
  buttonText,
  classNamePostfix,
}) {
  return (
    <root.div>
      <link
        rel="stylesheet"
        href={new URL("action-banner.css", import.meta.url).toString()}
      />
      <div className={`action-banner action-banner-style-${classNamePostfix}`}>
        <div className="info">{message}</div>
        <div className="signup">
          <Button text={buttonText} size="small" onClick={onClick} />
        </div>
      </div>
    </root.div>
  );
}
