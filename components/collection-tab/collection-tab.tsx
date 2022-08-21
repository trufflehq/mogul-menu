import React from "https://npm.tfl.dev/react";
import Collectibles from "../collectibles/collectibles.tsx";

export default function CollectionTab() {
  return (
    <div className="c-collection-tab">
      <Collectibles $emptyState={<div>Loading...</div>} />
    </div>
  );
}
