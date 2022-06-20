import { JSX } from "react";

export interface TabProps {
  tabId: string;
}

export type TabElement = (props: TabProps) => JSX.Element;

export interface TabDefinition {
  text: string;
  slug: string;
  imgUrl: string;
  $el?: TabElement;
}

export interface TabState {
  hasBadge: boolean;
  text: string;
  icon: string;
  isActive: boolean;
}

export type TabStateMap = Record<string, TabState>;
