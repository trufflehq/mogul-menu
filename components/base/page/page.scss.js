import { scss } from "../../../deps.ts";

export default scss`
.c-page {
  > .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px 12px 20px;
    border-top: 1px solid rgba(var(--bg-base-text-rgb-csv), 0.16);
    border-bottom: 1px solid rgba(var(--bg-base-text-rgb-csv), 0.16);

    > .left {
      display: flex;
      align-items: center;
      gap: 18px;

      > .text {
        font-weight: 600;
        font-size: 18px;
        letter-spacing: 0.04em;
      }

      > .back-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        outline: none;

        &:focus, &:active {
          border: 2px solid var(--mm-color-primary);
        }
      }
    }
  } 

  > .content {
    overflow-y: auto;
    flex: 1;
  }
}
`;
