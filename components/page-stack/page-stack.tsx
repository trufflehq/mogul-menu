import { React, useEffect, useStyleSheet } from "../../deps.ts";
import styleSheet from "./page-stack.scss.js";
import { usePageStack } from '../../state/page-stack/mod.ts'

export default function PageStack({
  background = "var(--mm-color-bg-primary)",
}: {
  background?: string
}) {
  const { pageStack, popPage } = usePageStack()
  useStyleSheet(styleSheet);

  const isPageStackEmpty = !pageStack || pageStack.length === 0;

  const handleEscape = (ev: KeyboardEvent) => {
    if(ev.key === 'Escape') {
      popPage()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleEscape, false)

    return () => {
      document.removeEventListener('keydown', handleEscape, false)
    }
  }, [])
  return (
    <>
      {isPageStackEmpty ? (
        <></>
      ) : (
        <div className="c-page-stack" style={{ "--background": background }}>
          <div className="container">
            {pageStack.map((Component, idx) => (
              <div key={idx} className="page">
                {/* {typeof Component === "function" ? <Component /> : Component} */}
                {
                  Component
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
