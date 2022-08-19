import { scss } from "../../deps.ts";

export default scss`
$extension-top-offset: 10px;
$extension-right-offset: 10px;
.extension-icon {
  cursor: pointer;
  position: absolute;
  z-index: 99999;
  top: $extension-top-offset;
  right: $extension-right-offset;
  background-image: url(https://cdn.bio/assets/images/creators/ludwig/extension_icon.png);
  background-size: 100%;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  transition: box-shadow 0.25s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.12);
  }
}
`