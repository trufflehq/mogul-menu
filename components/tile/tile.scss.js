import { scss } from "../../deps.ts";

export default scss`
@mixin tooltip {
  .text {
    position: absolute;
    bottom: -28px;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 2px 10px;
    background-color: var(--mm-color-bg-secondary);
    border: 1px solid var(--mm-color-bg-tertiary);
    border-radius: 4px;
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.004em;
    visibility: hidden;
  }

  &:hover {
    cursor: pointer;

    > .text {
      visibility: visible;
    }
  }
}
.c-tile {
  background: red;
  $border-radius: 6px;
  $tile-bg: var(--mm-color-bg-secondary);
  min-width: 0;

  border-radius: $border-radius;
  display: flex;
  flex-direction: column;
  min-height: 157px;
  background-color: $tile-bg;
  border: 1px solid var(--mm-color-bg-tertiary);
  transition: filter linear 100ms;
  position: relative;

  &.clickable:hover {
    filter: brightness(80%);
    cursor: pointer;
  }

  >.header {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 24px 8px 0 16px;
    height: 44px;
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;
    box-sizing: border-box;
    margin-bottom: 20px;

    >.icon {
      background-color: var(--mm-color-bg-primary);
      border-radius: 100%;
      width: 40px;
      height: 40px;
      border-width: 1px;
      border-style: solid;

      >div {
        margin: auto;
      }
    }

    >.text {
      font-weight: 500;
      font-size: 16px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: black;
    }
  }

  > .remove {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 12px;
    right: 8px;
    width: 32px;
    height: 32px;

    border-radius: 50%;
    box-sizing: border-box;
    border: 1px solid var(--error-red);

    @include tooltip;
  }
}
`;
