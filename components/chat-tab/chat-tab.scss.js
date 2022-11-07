import { scss } from "../../deps.ts";

export default scss`
.c-chat-tab {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .youtube {
    clip-path: inset(calc(100% - 112px) 0 0 0);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;

    > iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}

.landscape {
  .c-chat-tab {
    max-height: 100vw;
    min-height: calc(100vw + 80px); /* cap the height of the menu body */
  }
}
`;
