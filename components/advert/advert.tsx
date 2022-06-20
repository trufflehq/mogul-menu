import React from "react";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx";

export default function Advert(props) {
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
          <Button
            text={buttonText}
            background={buttonBgColor}
            borderRadius="4px"
            textColor={buttonTextColor}
            href={buttonHref}
            onClick={buttonOnClick}
          />
        </div>
      </div>
    </div>
  );
}
