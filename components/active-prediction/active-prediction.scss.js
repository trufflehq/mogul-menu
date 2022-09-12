import { scss } from "../../deps.ts";

export default scss`
$option-1-color: #419BEE;
$option-2-color: #EE416B;

@mixin extension-button {
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  color: white;
  letter-spacing: initial;
}

@mixin question-banner {
  text-align: center;
  padding: 16px 0;

  .question {
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    margin-bottom: 2px;
  }

  .status {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
  }
}

.c-active-prediction {
  color: white;

  .form {
    padding: 16px;
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: var(--tertiary-base);
    margin-bottom: 20px;

    >.amount {
      display: flex;
      flex-direction: column;
      align-items: end;

      >.value {
        display: flex;
        align-items: center;
        margin-top: 6px;

        >.input {
          position: relative;
          max-width: 140px;
          margin-right: 12px;

          >.z-channel-points-icon {
            position: absolute;
            right: 28px;
            top: 3px;
            height: 100%;
          }

          >.z-input {

            >.input-wrapper {
              >input.input {
                text-align: right;
                background: #FFFFFF14;
                border: none;
                padding-right: 45px;
                padding-top: 12px;
              }
            }
          }
        }

        >.current-amount {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    >.error {
      margin: 12px 0;
      color: red;
      font-weight: 700;
    }
  }

  .question-banner {
    @include question-banner;
  }

  >.options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: stretch;

    >.option {
      min-width: 0;
      display: flex;
      flex-direction: column;

      &.option1 {
        margin-left: 26px;
        margin-right: 6px;

        >.name {
          color: $option-1-color;
        }

        >.stats {
          border: 1px solid $option-1-color;

          >.label {
            color: $option-1-color;
          }
        }
      }

      &.option2 {
        margin-left: 6px;
        margin-right: 26px;

        >.name {
          color: $option-2-color;
        }

        >.stats {
          border: 1px solid $option-2-color;

          >.label {
            color: $option-2-color;
          }
        }
      }

      >.name {
        font-weight: 600;
        font-size: 18px;
        line-height: 27px;
        margin-bottom: 5px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      >.stats {
        display: grid;
        grid-template-columns: auto 1fr;
        border-radius: 12px;
        padding: 16px 17px;
        position: relative;
        flex-grow: 1;

        >.percentage {
          grid-column: 1 / span 2;
          justify-self: center;
          font-weight: 600;
          font-size: 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        >.label {
          justify-self: end;
          font-weight: 600;
          font-size: 12px;
          line-height: 18px;
          text-align: right;
        }

        >.value {
          font-weight: 600;
          font-size: 12px;
          line-height: 18px;
        }

        >.label:not(:last-child) {
          margin-bottom: 12px;
        }

        >.vote {
          grid-column: 1 / span 2;

          > button {
            width: 100%;

            .vote-button-content {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3px;
            }
          }

        }
      }

      >.winner-container {
        padding: 8px;
      }
    }
  }

  .z-winner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #EBAD64;
    font-size: 14px;
    font-weight: 500;

    &:not(.is-visible) {
      visibility: hidden;
    }
  }

  .z-button.style-primary {
    @include extension-button;
  }

  >.summary-info {
    text-align: center;

    >.user-prediction-text {
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 6px;

      .option1 {
        color: $option-1-color;
      }

      .option2 {
        color: $option-2-color;
      }
    }

    >.channel-point-count {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      margin-bottom: 4px;

      >.text {
        margin-top: 2px;
      }
    }

    >.status {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
    }
  }

  .bmargin-24 {
    margin-bottom: 24px;
  }
}


span>.z-channel-points-icon {
  display: inline-block;

  >div {
    display: inline-block;
  }
}
`;
