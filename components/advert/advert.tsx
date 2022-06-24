import React from "https://npm.tfl.dev/react";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.jsx";

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
    buttonBgColorHover,
  } = props;

  return (
    <ScopedStylesheet url={new URL("advert.css", import.meta.url)}>
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
              backgroundHover={buttonBgColorHover}
              borderRadius="4px"
              textColor={buttonTextColor}
              href={buttonHref}
              onClick={buttonOnClick}
              outlineHover="1px solid var(--truffle-color-text-bg-primary)"
            />
          </div>
        </div>
      </div>
    </ScopedStylesheet>
  );
}
