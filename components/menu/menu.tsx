import { React } from "../../deps.ts";
import MenuBody from "./menu-body.tsx";
import MenuProvider from "./menu-provider.tsx";
import { File } from "../../types/mod.ts";
import { Vector } from "../draggable/draggable.tsx";

export interface MogulMenuProps {
  iconImageObj: File;
  defaultPositionElementQuerySelector?: string;
  defaultPositionOffset?: Vector;
}
export default function Menu(props: MogulMenuProps) {
  return (
    <MenuProvider {...props}>
      <MenuBody
        {...props}
      />
    </MenuProvider>
  );
}
