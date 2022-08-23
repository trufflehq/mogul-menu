import { scss } from "../../../deps.ts";

export default scss`
.c-dialog-container {
  width: 100%;
  // height: 100%;
  position: absolute ;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  bottom: 0;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.8);

  > div {
    max-height: 80%;
  }
}
`;
