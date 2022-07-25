import React, { useEffect, useRef } from "https://npm.tfl.dev/react";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import { useDialog } from "../dialog-container/dialog-service.ts";
import ScopedStylesheet from "../base/stylesheet/stylesheet.tsx";

const CLOSE_DELAY_MS = 450; // 0.45s for animation

export default function Dialog(props) {
  const {
    id,
    $title,
    $actions,
    isWide,
    widthPx,
    $topLeftButton,
    $topRightButton,
    $content = "",
    maxHeightPx = 420,
    minHeightPx = 0,
    onCancel,
    hasPadding = true,
    shouldPreventClose,
    isBlurredBg = true,
    className = "default-dialog",
  } = props;
  const { popDialog } = useDialog();

  const $$ref = props.$$ref || useRef();

  useEffect(() => {
    setTimeout(() => $$ref.current.classList.add("is-mounted"), 10);
    !shouldPreventClose && window.addEventListener("keydown", keyListener);

    return () => window.removeEventListener("keydown", keyListener);
  }, []);

  function close() {
    $$ref.current.classList.remove("is-mounted");
    setTimeout(popDialog, CLOSE_DELAY_MS);
    onCancel?.();
  }

  function keyListener(e: KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Esc" || e.keyCode === 27) {
      e.preventDefault();
      close();
    }
  }

  const hasTop = $topLeftButton || $topRightButton || $title;

  return (
    <ScopedStylesheet url={new URL("dialog.css", import.meta.url)}>
      <div
        ref={$$ref}
        className={`c-dialog use-css-vars-creator ${className} ${classKebab({
          hasPadding,
          isWide,
          isBlurredBg,
        })}`}
      >
        <div className="backdrop" onClick={!shouldPreventClose && close} />
        <div
          className="dialog"
          style={{ width: widthPx ? `${widthPx}px` : undefined }}
        >
          {hasTop && (
            <div className="top">
              <div className="inner">
                {$topLeftButton && (
                  <div className="top-left">{$topLeftButton}</div>
                )}
                {$title && <div className="title">{$title}</div>}
                {$topRightButton && (
                  <div className="top-right">{$topRightButton}</div>
                )}
              </div>
            </div>
          )}
          <div
            className="content"
            style={{
              maxHeight: maxHeightPx,
              minHeight: minHeightPx ?? 0,
            }}
          >
            {$content}
          </div>
          {$actions && <div className="actions">{$actions}</div>}
        </div>
      </div>
    </ScopedStylesheet>
  );
}
