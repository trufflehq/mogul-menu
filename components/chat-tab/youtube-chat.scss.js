import { scss } from "../../deps.ts";

export default scss`
.c-youtube-chat {
  display: grid;
  grid-template-columns: 1fr;
  flex: 1;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .messages {
    display: flex;
    flex-direction: column-reverse;
    overflow-y: auto;
    padding: 8px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 112px;

    > .message {
      display: block;
      font-size: 13px;
      line-height: 16px;
      padding: .3rem 1rem; /* from twitch */
      // align-items: flex-start;
      font-family: Inter;
      > .author {
        display: inline-block;
        align-items: baseline;
        margin-right: 4px;
        gap: 2px;

        > .badge {
          width: 16px;
          height: 16px;
          margin-bottom: -2px;
          margin-right: 4px;
          box-sizing: border-box;
        }

        
        > .name {
          font-weight: 700;
   
          > .separator {
            color: #efeff1;
          }
        }
      }

      > .message-text {
        // display: flex;
        // align-items: center;
      }
    }
  }
  
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
