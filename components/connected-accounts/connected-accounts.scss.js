import { scss } from "../../deps.ts";

export default scss`
.c-browser-extension-earn-xp {
  color: var(--bg-base-text);
  margin-bottom: 36px;

  > .connections {
    display: flex;
    gap: 16px;

    > .connection {
      cursor: pointer;
      img {
        width: 40px;
        border-radius: 4px;
      }
    }
  }

  > .connected-connections {
    margin-top: 20px;

    > .connection:not(:last-child) {
      margin-bottom: 12px;
    }

    > .connection {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px;
      box-sizing: border-box;
      height: 40px;

      > .left {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        > img {
          width: 40px;
          border-radius: 4px;
        }

        > .name {
          margin-left: 12px;
          font-size: 16px;
          font-weight: 700;
        }

        > .connected {
          margin-left: 20px;
          font-size: 12px;
          font-weight: 400;
          color: #38F155;
        }
      }

      > .right {
        padding: 0 14px;
      }

    }
  }
}
`;
