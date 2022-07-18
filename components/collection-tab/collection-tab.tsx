import React, { useEffect } from "https://npm.tfl.dev/react";
import { useTabId } from "../../util/tabs/tab-id.ts";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@~0.1.0/utils/snack-bar.ts";
import SnackBar from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/snack-bar/snack-bar.tsx";
import Collectibles from "../collectibles/collectibles.tsx";

export default function CollectionTab() {
  return (
    <div className="c-collection-tab">
      <Collectibles $emptyState={<div>Loading...</div>} />
    </div>
  );
}
