import { JSX } from 'react' 

export interface TabProps {
  tabId: string;
}

export type TabElement = (props: TabProps) => JSX.Element

export interface TabDefinition {
  text: string;
  slug: string;
  imgUrl: string;
  $el?: TabElement
}
