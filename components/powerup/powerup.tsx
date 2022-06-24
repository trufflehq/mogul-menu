import React from "https://npm.tfl.dev/react";

export default function Powerup({ powerup }) {
  if (!powerup?.jsx) return;
  return (
    <div className="powerup">
      {/* FIXME */}
      {
        /* <Components.RenderedJsByJsx
      jsx={powerup.jsx}
      components={_.map(powerup.componentRels, ({ component }) => {
        return getModel().component.getCachedComponentById(component.id)
      })}
    /> */
      }
    </div>
  );
}
