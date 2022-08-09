import { scss } from "../../../deps.ts";

export default scss`
.c-dialog {
  width: 424px;
  background: var(--mm-color-bg-secondary);
  color: var(--mm-color-text-bg-secondary);
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  >.flex {
    height: auto;
    display: flex;
    flex-direction: column;

    >.content {
      max-height: 75vh;
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: auto;
      overflow: auto;
    }

    >.top-actions {
      background: var(--background);
      color: var(--text-color);
      display: flex;
      justify-content: space-between;
      flex-shrink: 0;

      >div {
        padding: 20px;
      }
    }

    >.bottom-actions {
      display: flex;
      gap: 12px;
      padding: 24px;
      flex-shrink: 0;

      &.fill {
        >* {
          flex: 1;
        }
      }

      &.left {
        justify-content: flex-start;
      }

      &.right {
        justify-content: flex-end;
      }
    }
  }
}
`;
