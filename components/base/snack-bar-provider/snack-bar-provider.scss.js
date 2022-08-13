import { scss } from "../../../deps.ts";

export default scss`
$container-width: 95vw;

.c-snack-bar-container {
  position: fixed;
  bottom: 16px;
  width: $container-width;
  left: calc((100vw - #{$container-width}) / 2);
  overflow: visible;
  z-index: 1000;
}
`;
