import { scss } from "../../deps.ts";

export default scss`
.c-youtube-chat {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .messages {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 8px 8px 112px 8px;
    height: 100%;
    background: var(--mm-color-bg-tertiary);

    > .inner {
      display: flex;
      flex-direction: column-reverse;
      height: 100%;
      overflow-y: scroll; /* has to be scroll, not auto */
      -webkit-overflow-scrolling: touch;
      width: 100%;
      overflow-x: hidden;
      box-sizing: border-box;
      z-index: 2;
      box-sizing: border-box;
      position: relative;
      padding-bottom: 8px;

      > .message {
        display: block;
        font-size: 13px;
        line-height: 16px;
        padding: .3rem 1rem; /* from twitch */
        word-wrap: break-word;
        word-break: break-word;
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
          word-wrap: break-word;
          word-break: break-word;
          overflow-wrap: break-word;
          overflow: hidden;
          min-height: 24px;

          // display: flex;
          // align-items: center;

          .truffle-emote {
            width: auto !important;
            height: 28px;
            margin: -1px 2px 1px;
            vertical-align: middle;
          }
        }
      }
    }
  }
  
  .youtube {
    clip-path: inset(calc(100% - 112px) 0 0 0);
    // position: fixed;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 1;
    // margin-top: -160px;  /* hack for android to slide the keyboard up */


    > iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}

.landscape {
  .youtube {
    margin-top: -120px; /* hack for android to slide the keyboard up */
  }
}
`;
