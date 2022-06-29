import React from "https://npm.tfl.dev/react";

export default function Powerup({ powerup }) {
  if (!powerup?.js) return;
  return (
    <div className="powerup">
      {/* FIXME */}
      {/* <Components.RenderedJsByJsx
      jsx={powerup.js}
      components={_.map(powerup.componentRels, ({ component }) => {
        return getModel().component.getCachedComponentById(component.id)
      })}
    /> */}
    </div>
  );
}
