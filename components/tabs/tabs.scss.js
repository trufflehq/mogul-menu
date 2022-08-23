import { scss } from "../../deps.ts";

export default scss`
.c-tab-component {
  display: none;

  &.is-active {
    display: block;
  }
}
`;
