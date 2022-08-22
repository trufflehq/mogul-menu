import { scss } from "../../deps.ts";

export default scss`
.c-tab-bar {
  flex-direction: row-reverse;
  box-sizing: border-box;
  max-height: 40px;

  display: flex;
  overflow-x: overlay;
  overflow-y: overlay;
  flex: 1;

  /* scrollbar fix for firefox */
  @-moz-document url-prefix() { 
    overflow-x: auto;
  }

  &.is-collapsed {
    overflow: hidden;
    > .tab {
      opacity: 0;
    }
  }

  >.tab {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    cursor: pointer;
    position: relative;

    padding: 0px 12px;

    &:hover {
      background-color: var(--mm-color-bg-tertiary);
    }

    &.is-active {
      background-color: var(--mm-color-bg-tertiary);
    }

    // &.has-badge>.icon {
    //   position: relative;
    //   @include badge(top-right);
    // }

    >.icon {
      margin-right: 8px;
    }

    >.title {
      white-space: nowrap;
    }
  }

  > .additional-tab-buttons {
    flex-shrink: 0;
    display: flex;
  }
}
// .tabs {
//   overflow: hidden;
// }
// .c-collapsible-tab-button {
//   &.is-collapsed {
//     max-width: 40px;
//   }
// }
`