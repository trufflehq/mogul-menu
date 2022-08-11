import { scss } from "../../deps.ts";

export default scss`
@mixin badge($location: bottom-right, $width: 6px, $height: 6px, $stroke: rgba(0, 0, 0, 1)) {
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    border: 1px solid $stroke;
    width: $width;
    height: $height;
    background: red;

    @if $location ==bottom-right {
      right: 4px;
      bottom: 4px;
    }

    @else if $location ==top-right {
      right: -4px;
      top: 0;
    }

    @else if $location ==outer-top-right {
      right: calc(-#{$width} * 1 / 3);
      top: calc(-#{$height} * 1 / 3);
    }

    @else if $location ==outer-bottom-right {
      right: calc(-#{$width} * 1 / 3);
      bottom: calc(-#{$height} * 1 / 3);
    }

    @else if $location ==outer-top-left {
      left: calc(-#{$width} * 1 / 3);
      top: calc(-#{$height} * 1 / 3);
    }
  }
}

@mixin roundedTriangle() {

  // https://stackoverflow.com/questions/14446677/how-to-make-3-corner-rounded-triangle-in-css
  .triangle {
    position: absolute;
    right: 12px;
    top: -4px;
    background-color: var(--tertiary-base);
    text-align: left;
    z-index: 1;
  }

  .triangle:before,
  .triangle:after {
    content: '';
    position: absolute;
    background-color: inherit;
  }

  .triangle,
  .triangle:before,
  .triangle:after {
    width: 20px;
    height: 20px;
    border-top-right-radius: 30%;
  }

  .triangle {
    transform: rotate(-60deg) skewX(-30deg) scale(1, .866);
  }

  .triangle:before {
    transform: rotate(-135deg) skewX(-45deg) scale(1.414, .707) translate(0, -50%);
  }

  .triangle:after {
    transform: rotate(135deg) skewY(-45deg) scale(.707, 1.414) translate(50%);
  }
}

// space for notification icon to show
$extension-top-offset: 10px;
$extension-right-offset: 10px;

$tab-body-padding: 16px;
$snackbar-container-width: 95%;
$closed-offest-width: 60px;

$ease-function: cubic-bezier(.4, .71, .18, .99);

// body {
//   background: transparent !important;
// }

.z-browser-extension-menu {
  height: 100%;
  width: 100%;
  position: relative;

  --error-red: rgba(238, 113, 113, 1);
  --success-green: rgba(107, 190, 86, 1);

  // TODO: rm this when we either include it in the design system or have it as a component prop
  --truffle-gradient: linear-gradient(281.86deg, #71DBDB 2.63%, #ADACDD 50.48%, #FF9DC6 94.5%);

  >.extension-icon {
    cursor: pointer;
    position: absolute;
    z-index: 99999;
    top: $extension-top-offset;
    right: $extension-right-offset;
    background-image: url(https://cdn.bio/assets/images/creators/ludwig/extension_icon.png);
    background-size: 100%;
    background-repeat: no-repeat;
    // background-color: var(--bg-base);
    background-color: rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    transition: box-shadow 0.25s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
      box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.12);
    }
  }

  &.position-chat {
    >.extension-icon {
      top: initial;
      bottom: 10px;
    }
  }

  >.menu {
    // we use clipping so extension menu can close w/ an animation
    clip-path: inset(0% 0% calc(100% - 40px) calc(100% - 40px));
    transition: clip-path .5s $ease-function;

    position: absolute;
    // space for notif icon
    right: $extension-right-offset;
    top: $extension-top-offset;
    // account for us starting at right and top offsets
    height: calc(100% - #{$extension-top-offset});
    width: calc(100% - #{$extension-right-offset});
    border-radius: 2px;
    box-sizing: border-box;
    background: var(--mm-color-bg-primary);
    color: var(--mm-color-text-bg-primary);
    font-family: var(--mm-font-family);
    border: 1px solid rgba(60, 58, 65, 1);

    >.inner {
      height: 100%;
      width: 100%;
      position: relative;
      display: flex;
      flex-direction: column;

      >.close {
        position: absolute;
        top: 48px;
        right: 12px;
        cursor: pointer;
      }

      >.body {
        flex: 1;
        overflow-y: auto;
        box-sizing: border-box;

        >.tab-component {
          display: none;

          &.is-active {
            display: block;
          }
        }

        &::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }

        >.prediction {
          background: var(--bg-base);
          position: absolute;
          z-index: 10;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 0;
            background: transparent;
          }

          >.close {
            height: 40px;
            display: flex;
            align-items: center;
            padding-left: 8px;
          }
        }
      }

      >.bottom {
        display: flex;
        justify-content: flex-end;
        max-height: 40px;
        width: 100%;

        >.tabs {
          opacity: 0;
          flex-direction: row-reverse;
          box-sizing: border-box;
          max-height: 40px;

          display: flex;
          overflow-x: overlay;
          overflow-y: overlay;
          flex: 1;

          scrollbar-gutter: stable;

          //fix for firefox
          scrollbar-width: none;
          margin-bottom: -5px;
          // margin-right: -5px;

          &::-webkit-scrollbar {
            width: 20px;
          }

          &::-webkit-scrollbar-track {
            background-color: transparent;
          }

          &::-webkit-scrollbar-thumb {
            background-color: var(--bg-base-text-10);
            border-radius: 20px;
            border: 4px solid transparent;
            background-clip: content-box;
          }

          &:hover::-webkit-scrollbar-thumb {
            background-color: var(--bg-base-text-50);
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

            &.has-badge>.icon {
              position: relative;
              @include badge(top-right);
            }

            >.icon {
              margin-right: 8px;
            }

            >.title {
              white-space: nowrap;
            }
          }
        }

        // TODO: generalize buttons next to tabs
        > .additional-tab-buttons {
          box-sizing: border-box;
          height: 100%;
          height: 40px;

          display: flex;

          /*> .c-channel-points {
            > .channel-points {
              display: none;
            }

            > .claim {
              display: none;

              &.is-visible {
                display: flex;
              }
            }
          }*/
        }

        >.extension-icon {
          background-color: var(--primary-base);
          border-radius: 0px;
          border: 1px solid transparent;
          position: relative;
        }

        >.extension-icon-placeholder {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
        }
      }

      >.page-stack {
        height: 100%;
        width: 100%;
        // allow to expand to full height (flex hack)
        min-height: 0;
        position: relative;
        display: flex;
        flex-direction: column;
        animation: animatebottom 0.4s $ease-function;

        @keyframes animatebottom {
          from {
            transform: translateY(100px);
            opacity: 0
          }

          to {
            transform: translateY(0);
            opacity: 1
          }
        }
      }

      >.tab-component {
        position: relative;
        flex: 1;
      }
    }

    // TODO: extract action banner component
    // .action-banner {
    //   display: flex;
    //   align-items: center;
    //   background-color: var(--secondary-base);
    //   box-sizing: border-box;
    //   padding: 2px 16px;

    //   > .info {
    //     font-size: 14px;
    //     line-height: 21px;
    //     font-weight: 600;
    //     color: var(--secondary-base-text);
    //     white-space: nowrap;
    //     overflow: hidden;
    //     text-overflow: ellipsis;
    //   }

    //   &.action-banner-style-twitch {
    //     background: #772CE8;

    //     > .info {
    //       color:rgba(255, 255, 255, 1);
    //     }
    //   }

    //   > .signup {
    //     display: flex;
    //     justify-content: flex-end;
    //     flex: 1;
    //     margin-left: 8px;

    //     > button {
    //       font-size: 12px;
    //       line-height: 18px;
    //       font-weight: 500;
    //       max-width: 120px;
    //       padding: 8px 24px;
    //       border-radius: 4px;
    //     }
    //   }
    // }
  }

  // TODO: generalize button in tab menu behavior
  // &.is-claimable {
  //   > .menu {
  //     clip-path: inset(0% 0% calc(100% - 40px) calc(100% - 78px));
  //     transition: clip-path .5s cubic-bezier(.4,.71,.18,.99);
  //   }
  // }

  &.position-chat {
    >.menu {
      clip-path: inset(calc(100% - 40px) 0% 0% calc(100% - 40px));
      top: initial;
      bottom: 10px;

      >.inner {
        >.body {
          order: 1;
        }

        >.bottom {
          order: 2;
        }
      }
    }

    // TODO: generalize button in tab menu behavior
    // &.is-claimable {
    //   > .menu {
    //     clip-path: inset(calc(100% - 40px) 0% 0% calc(100% - 78px));
    //   }
    // }

    .c-snack-bar-container {
      bottom: 40px + 16px;
    }
  }
}

.z-browser-extension-menu.is-open {
  >.menu {
    clip-path: inset(0% 0% 0% 0%);
    transition: clip-path .5s cubic-bezier(.4, .71, .18, .99);

    >.inner {
      >.bottom {
        >.tabs {
          opacity: 1;
        }
      }
    }
  }

  >.c-snack-bar-container {
    top: unset;
    right: unset;
    width: 95%;
    max-width: unset;
    left: calc((100% - #{$snackbar-container-width}) / 2);
    pointer-events: none;

    >.c-snack-bar-el {
      display: flex;
      pointer-events: all;
    }
  }
}


.z-browser-extension-menu.has-notification:not(.is-open) {
  >.extension-icon {
    @include badge(outer-bottom-right, 16px, 16px, rgba(0, 0, 0, 1));
  }
}

.z-browser-extension-menu_terms {
  margin-top: 16px;

  .paragraph {
    margin-bottom: 8px;
  }
}

.c-tile {
  $border-radius: 6px;
  $tile-bg: var(--bg-mod-inverse-4);
  min-width: 0;

  border-radius: $border-radius;
  display: flex;
  flex-direction: column;
  min-height: 157px;
  background-color: $tile-bg;
  border: 1px solid var(--tertiary-base);
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
      background-color: $tile-bg;
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
      color: $tile-bg;
    }
  }
}

.c-advert {
  border: 1px solid var(--secondary-base);
  border-radius: 6px;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;

  >.image {
    flex: 0 1 153px;

    >img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  >.content {
    flex: 1 0 0%;
    padding: 16px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;

    >.text {
      >.ad {
        font-weight: 400;
        font-size: 14px;
        line-height: 21px;
        letter-spacing: 0.0025em;
        color: var(--bg-base-text-80);
      }

      >.tagline {
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.005em;
      }
    }

    >.actions {
      >.c-button {
        &:hover {
          border: 1px solid var(--bg-base-text);
        }
      }
    }

  }
}

.c-home-tab {
  >.header {
    display: flex;
    align-items: center;

    margin-bottom: 16px;

    >.user {
      display: flex;
      flex: 1;


      >.c-account-avatar {
        margin-right: 16px;
      }

      >.info {
        display: flex;
        flex-direction: column;
        justify-content: center;

        >.top {
          display: flex;
          align-items: center;
          margin-bottom: 4px;

          >.name {
            font-size: 20px;
            font-weight: 600;
          }

          >.powerup {
            width: 24px;
            height: 24px;
            margin-left: 8px;
          }

        }

        >.amounts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;

          >.amount {
            display: flex;
            align-items: center;

            >.icon {
              margin-right: 8px;
            }
          }
        }

      }
    }

    >.support {
      font-size: 12px;
      line-height: 16px;
      text-decoration: underline;
      color: var(--secondary-base);
      margin-right: 16px;
      box-sizing: border-box;

      &:hover {
        color: var(--primary-base);
      }
    }


    >.actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;

      >.icon {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 1px solid var(--bg-base-text-20)
      }
    }

  }

  >.tile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }


  >.banner {
    font-size: 16px;
    font-weight: 600;
    background: var(--tertiary-base);
    padding: 4px 15px;
    margin: auto (-$tab-body-padding);
  }
}

.c-mogul-pass-tab {
  >.title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 2px;
  }

  >.description {
    margin-bottom: 4px;
  }

  >.description,
  >.learn-more {
    font-size: 14px;
    font-weight: 400;
  }

  >.learn-more {
    color: var(--secondary-base);
    margin-bottom: 20px;
    cursor: pointer;
    text-decoration: underline;
  }
}

.c-settings-page_content {
  padding: 16px;

  >.settings {
    margin-bottom: 16px;

    >.name {
      margin-top: 8px;
    }

    >.color {
      margin-top: 8px;
    }
  }

  .c-snack-bar {
    display: flex;
    align-items: center;
    padding: 4px 16px;

    >.actions {
      margin-top: 0;
    }
  }
}

.c-position-chooser {
  >.label {
    font-weight: 700;
    font-size: 14px;
    margin-top: 8px;
    margin-bottom: 8px;
  }

  >.option {
    font-size: 14px;
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 4px;
    border: 1px solid var(--bg-base-text-10);


    &:hover {
      border: 1px solid var(--bg-base-text-30);
    }

    &.is-selected {
      border: 1px solid var(--bg-base-text-60);
    }
  }
}

.c-prediction-page_no-active-predictions {
  color: var(--bg-base-text-60);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.c-predictions-page_channel-points {
  display: flex;
  align-items: center;
  border: 1px solid #EBC564;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 6px 12px;
  width: fit-content;
  color: #FFFFFF;

  font-size: 14px;
  font-weight: 400;

  >.icon {
    margin-right: 8px;
  }
}

.c-faze-sponsors {
  grid-column: span 2;
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 20px;
  margin-top: 16px;
  min-height: 200px;

  >.sponsor {
    width: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 75%;
    border: 1px solid var(--bg-base-text);
    border-radius: 4px;
  }
}

.c-faze-giveaway {
  background: var(--primary-base);
  color: var(--primary-base-text);
  font-size: 20px;
  grid-column: span 2;
  padding: 24px 12px;
  text-align: center;
  border-radius: 4px;

  >.header-image {
    max-width: 568px;
    margin: 0 auto;
    margin-bottom: 20px;
  }

  >.text {
    margin-bottom: 16px;
  }
}

// this class can be used in child components so that they're not affected by the default padding 
// .reach-edge {
//   margin: auto (-$tab-body-padding);
// }

.c-collectible-empty {
  margin: 24px auto;
  box-sizing: border-box;
  max-width: 348px;

  >.wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;

    >.preview {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;

      >.stack {
        position: relative;
        width: fit-content;
        margin: auto;

        >.block {
          display: flex;
          justify-content: center;
          align-items: center;

          width: 48px;
          height: 48px;
          border: 1px solid var(--bg-base);
          border-radius: 6px;

          &.front {
            background-color: var(--secondary-base);
            z-index: 2;
            position: absolute;
            left: 12px;
            top: 12px;
          }

          &.back {
            position: relative;
            background-color: var(--primary-base);
            z-index: 1;
          }
        }
      }

      >.message {
        margin-top: 24px;
        font-size: 16px;
        line-height: 24px;
        font-weight: 600;
      }
    }

    >.body {
      background-color: var(--tertiary-base);
      border-radius: 6px;
      padding: 24px 32px;

      >.title {
        font-size: 16px;
        line-height: 24px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 24px;
      }


      >.way-to-earn {
        display: flex;
        margin-bottom: 24px;

        >.left {}

        >.right {
          display: flex;
          flex-direction: column;
          padding-left: 12px;

          >.description {
            font-size: 16px;
            line-height: 24px;
            font-weight: 400;
            margin-bottom: 12px;
          }

          >.button {
            margin-bottom: 12px;

            >button {
              background: var(--highlight-gradient, var(--primary-base));
              color: var(--priimary-base-text);
              border-radius: 4px;
              background-size: 200%;
              background-position: center;
            }
          }

          >.link {
            text-decoration: underline;
            cursor: pointer;
          }
        }
      }
    }
  }
}


.c-economy-action-dialog {
  .dialog {
    // TODO add a background secondary css var
    background-color: rgba(22, 31, 44, 1) !important;

    >.top {
      background-color: var(--primary-base) !important;
      color: var(--primary-base-text);
    }
  }
}

@mixin font-body-bold {
  font-size: 14px;
  line-height: 21px;
  font-weight: 600;
  color: var(--bg-base-text);
}

@mixin font-body-caption {
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
  color: var(--bg-base-text-60);
}


.c-economy-action {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin-bottom: 20px;

  >.name {
    @include font-body-bold;
  }

  >.reward {
    display: flex;
    align-items: center;
    margin-top: 2px;

    >.icon {
      margin-right: 4px;
    }

    >.amount {
      @include font-body-bold;
    }
  }

  >.description {
    margin-top: 4px;
    @include font-body-caption;
  }
}

.c-learn-more {
  box-sizing: border-box;

  >.title {
    @include font-body-bold();
    margin-bottom: 8px;
  }

  >.button {
    >a {
      font-size: 14px;
      font-weight: normal;
      border-radius: 4px;
    }
  }
}

.c-new-prediction {
  text-decoration: underline;
  cursor: pointer;
}

.c-extension-user-tooltip {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  background: var(--tertiary-base);
  max-width: 200px;
  width: 100%;

  @media (min-width: 768px) {
    max-width: 232px;
  }

  >.message {
    position: relative;
    z-index: 2;
  }

  >.button {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;

    >button {
      padding: 16px 8px;
      border-radius: 4px;
    }
  }

  @include roundedTriangle();
}
`;
