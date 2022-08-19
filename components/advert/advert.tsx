import { React, useStyleSheet } from "../../deps.ts";
import Button from "../base/button/button.tsx";

import styleSheet from "./advert.scss.js";

export default function Advert(props) {
  useStyleSheet(styleSheet);
  const {
    className,
    imageSrc,
    hashtag,
    tagline,
    buttonHref,
    buttonOnClick,
    buttonText,
    buttonBgColor,
    buttonTextColor,
    buttonBgColorHover,
  } = props;

  return (
    <div className={`c-advert ${className}`}>
      <div className="image">
        <img src={imageSrc} alt="Ad" />
      </div>
      <div className="content">
        <div className="text">
          {/* <div className='ad'>#ad</div> */}
          <div className="ad">{hashtag}</div>
          <div className="tagline">{tagline}</div>
        </div>
        <div className="actions">
          <Button onClick={buttonOnClick}>{buttonText}</Button>
        </div>
      </div>
    </div>
  );
}
