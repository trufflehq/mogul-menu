import React from "https://npm.tfl.dev/react";
import _ from "https://npm.tfl.dev/lodash?no-check";

export default function ActivePowerups({ activePowerups }) {
  return _.map(
    _.take(
      _.filter(activePowerups, ({ powerup }) => powerup?.jsx),
      1,
    ),
    (activePowerup) => <Powerup powerup={activePowerup?.powerup} />,
  );
}
