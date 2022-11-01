import { scss } from "../../deps.ts";

export default scss`
.c-chat-tab {
  display: flex;
  flex-direction: column;
  flex: 1;
  /* height: calc(100vh - 77vw);*/
  height: 100%;
  /* max-height: calc((100% - 68vw) - 40px); */
  
  > iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

.landscape {
  .c-chat-tab {
    max-height: 100vw;
    min-height: calc(100vw + 80px); /* cap the height of the menu body */
  }
}
`;
