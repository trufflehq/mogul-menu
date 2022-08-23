import { scss } from "../../deps.ts";

export default scss`
.c-extension-icon {
  cursor: pointer;
  background-image: url(https://cdn.bio/assets/images/creators/ludwig/extension_icon.png);
  background-size: 100%;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  flex-shrink: 0;
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

.c-extension-icon {
  background-color: var(--primary-base);
  border-radius: 0px;
  position: relative;
}
`