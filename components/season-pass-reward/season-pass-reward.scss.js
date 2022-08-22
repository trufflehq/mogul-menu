import { scss } from "../../deps.ts";

export default scss`
.c-reward {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 16px 0;
  border-radius: 4px;
  z-index: 2;
  gap: 12px;

  &.has-tooltip {
    cursor: pointer;
  }

  &.has-tooltip:not(.is-selected):hover {
    background-color: rgba(var(--secondary-base-rgb-csv), 0.35);
  }

  >.inner {
    position: relative;
    z-index: 2;

    >.image {
      margin-bottom: 8px;

      >img {
        width: 56px;
        height: 56px;
        display: block;
        margin: auto;
      }
    }

    >.name {
      font-weight: 600;
      text-align: center;
      font-size: 10px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }

  .status-icon {
    box-sizing: border-box;
    position: absolute;
    right: 6px;
    top: 6px;
    z-index: 3;
  }

  &.free {
    border: 1px solid var(--mm-color-primary);
    background-color: transparent;
  }

  // &.paid {
  // TODO - bring this back for multiple battle pass tiers
  // &::before {
  //   z-index: 1;
  //   content: '';
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  //   bottom: 0;
  //   background: var(--bg-base);
  //   border-radius: calc(14px * var(--border-radius-multiplier));
  // }
  // border-style: solid;
  // border-width: 1px;
  // border-color: transparent !important;
  // background: linear-gradient(94.02deg, var(--secondary-base) 0%, var(--primary-base) 100%), var(--secondary-base) !important;
  // }

  &.is-selected {
    background: var(--mm-color-bg-secondary);
  }
}
`;
