import React from "https://npm.tfl.dev/react";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";
import {
  createSubject,
  Obs,
  op,
} from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";

import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";
import Icon from "https://tfl.dev/@truffle/ui@0.0.3/components/icon/icon.js";
import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.js";

/**
 * @callback onExit
 */

/**
 * @typedef {Object} DialogButton
 * @property {string} text
 * @property {string} textColor
 * @property {string} bg
 * @property {Function} onClick
 * @property {Stream} isDisabledStream
 */

/**
 * @param {Object} props
 * @param {Object} props.imgRel A fileRel object for an image to display for the item
 * @param {onExit} props.onExit Called if the user selects the X button or clicks out of the dialog
 * @param {'center'|'left'} props.displayMode Whether the dialog should display the content and the image centered or left aligned. valueText is not shown in center mode.
 * @param {JSX} props.headerText The header text of the dialog, appears above the child image/components.
 * @param {JSX} props.$title The dialog title.
 * @param {JSX} props.highlightBg Sets a css var for a highlight background.
 * @param {JSX} props.primaryText The call to action text underneath the child image/components.
 * @param {JSX} props.valueText If the dialog is in left display mode, the valueText will appear between the primary and secondary text.
 * @param {JSX} props.secondaryText Smaller, more faded text under the primary text. Suitable for a description.
 * @param {Array<DialogButton>} props.buttons
 * @returns {Object}
 */
export default function ItemDialog({
  displayMode = "center",
  imgRel,
  $children,
  $controls,
  onExit,
  $title,
  errorStream,
  highlightBg,
  headerText,
  primaryText,
  valueText,
  secondaryText,
  secondaryTextStyle,
  buttons,
}) {
  if (!onExit)
    console.warn("[browser-extension-item-dialog] onExit not defined");
  if (!imgRel)
    console.warn("[browser-extension-item-dialog] fileRel not defined");

  const { error } = useObservables(() => ({
    error: errorStream?.obs,
  }));
  const onExitHandler = () => {
    onExit?.();
  };

  const actions = (
    <>
      {buttons?.map((button, idx) => {
        if (!button.onClick)
          console.warn(
            `[browser-extension-item-dialog] button ${idx} does not have a click handler defined`
          );

        const { isDisabled } = useObservables(() => ({
          isDisabled: button.isDisabledStream?.obs ?? createSubject(false).obs,
        }));

        return (
          <div key={idx} className="button">
            <Button
              key={idx}
              text={button.text}
              isFullWidth={true}
              bg={button.bg}
              borderRadius={button.borderRadius}
              bgColor={button.bgColor}
              style={button.style}
              textColor={button.textColor}
              isDisabled={isDisabled}
              shouldHandleLoading={true}
              onClick={() => {
                return button.onClick?.();
              }}
            />
          </div>
        );
      })}
    </>
  );

  if (displayMode === "left") {
    return (
      <div className="z-browser-extension-item-dialog left use-css-vars-creator">
        <style>
          {`
          .z-browser-extension-item-dialog {
            --highlight-gradient: ${highlightBg ?? ""};
          }
        `}
        </style>
        <div className="body">
          <div className="image">
            <ImageByAspectRatio
              imageUrl={getModel().image.getSrcByImageObj(imgRel?.fileObj)}
              aspectRatio={imgRel?.fileObj?.data?.aspectRatio}
              heightPx={56}
              widthPx={56}
            />
          </div>
          <div className="info">
            <div className="primary-text">{primaryText}</div>
            <div className="value-text">{valueText}</div>
            <div className="secondary-text">{secondaryText}</div>
          </div>
          {error && <div className="error">{error}</div>}
        </div>
        <div className="actions">{actions}</div>
        {/* <Component
          slug="dialog"
          props={{
            $title,
            $content: (
              <div className="body">
                <div className="image">
                  <Component
                    slug="image-by-aspect-ratio"
                    props={{
                      imageUrl: model.image.getSrcByImageObj(imgRel?.fileObj),
                      aspectRatio: imgRel?.fileObj?.data?.aspectRatio,
                      heightPx: 56,
                      widthPx: 56,
                    }}
                  />
                </div>
                <div className="info">
                  <div className="primary-text">{primaryText}</div>
                  <div className="value-text">{valueText}</div>
                  <div className="secondary-text">{secondaryText}</div>
                </div>
                {error && <div className="error">{error}</div>}
              </div>
            ),
            $actions: actions,
            $topRightButton: (
              <div className="close-button">
                <Component
                  slug="icon"
                  props={{
                    icon: "close",
                    color: cssVars.$bgBaseText,
                    onclick: onExitHandler,
                  }}
                />
              </div>
            ),
          }}
        /> */}
      </div>
    );
  }

  return (
    <div className="z-browser-extension-item-dialog center use-css-vars-creator">
      <style>
        {`
        .z-browser-extension-item-dialog {
          --highlight-gradient: ${
            highlightBg ?? "var(--tfl-color-primary-fill)"
          };
        }
      `}
      </style>
      <div className="body">
        {!$title ? <CloseButton onExitHandler={onExitHandler} /> : null}
        {headerText && <div className="header-text">{headerText}</div>}
        <div className="children">
          {$children || (
            <ImageByAspectRatio
              imageUrl={getModel().image.getSrcByImageObj(imgRel?.fileObj)}
              aspectRatio={imgRel?.fileObj?.data?.aspectRatio}
              heightPx={72}
              widthPx={72}
            />
          )}
        </div>
        <div className="primary-text">{primaryText}</div>
        <div className={`secondary-text ${secondaryTextStyle}`}>
          {secondaryText}
        </div>
        {error && <div className="error">{error}</div>}
        {$controls && <div className="controls">{$controls}</div>}
      </div>
      <div className="actions">{actions}</div>
      {/* <Component
        slug="dialog"
        props={{
          onCancel: onExitHandler,
          $title,
          $topRightButton: $title ? (
            <CloseButton onExitHandler={onExitHandler} />
          ) : null,
          $content: (
            <div className="body">
              {!$title ? <CloseButton onExitHandler={onExitHandler} /> : null}
              {headerText && <div className="header-text">{headerText}</div>}
              <div className="children">
                {$children || (
                  <Component
                    slug="image-by-aspect-ratio"
                    props={{
                      imageUrl: model.image.getSrcByImageObj(imgRel?.fileObj),
                      aspectRatio: imgRel?.fileObj?.data?.aspectRatio,
                      heightPx: 72,
                      widthPx: 72,
                    }}
                  />
                )}
              </div>
              <div className="primary-text">{primaryText}</div>
              <div className={`secondary-text ${secondaryTextStyle}`}>
                {secondaryText}
              </div>
              {error && <div className="error">{error}</div>}
              {$controls && <div className="controls">{$controls}</div>}
            </div>
          ),
          $actions: actions,
        }}
      /> */}
    </div>
  );
}

function CloseButton({ onExitHandler }) {
  return (
    <div className="close-button">
      <Icon
        icon="close"
        color="var(--tfl-color-on-bg-fill)"
        onclick={onExitHandler}
      />
    </div>
  );
}
