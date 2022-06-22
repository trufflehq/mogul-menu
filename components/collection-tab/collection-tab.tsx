import React, { useEffect } from "react";
import { useTabId } from "../../util/tabs/tab-id.ts";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js";
import SnackBar from "https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar/snack-bar.jsx";
import Collectibles from "../collectibles/collectibles.tsx";

export default function CollectionTab() {
  return (
    <div className="c-collection-tab">
      <Collectibles
        $emptyState={<div>Loading...</div>}
        onViewCollection={() => null}
      />
    </div>
  );
}
