import { scss } from "../../deps.ts";

export default scss`
.c-channel-points {
  display: flex;
  align-items: center;
  flex: 1;
  width: 100%;
  position: relative;
  min-height: 30px;
  max-height: 40px;
  --yt-dark-bg: rgba(33, 33, 33, 0.98);

  &:hover:after {
    background: var(--mm-color-bg-primary);
    border: 1px solid var(--mm-color-primary);
    content: attr(data-title);
    display: block;
    position: absolute;
    font-family: var(--mm-font-family);
    border-radius: 2px;
    padding: 2px 4px;
    left: 8px;
    top: 2px;
    font-size: 12px;
    color: var(--mm-color-text-bg-primary);
    z-index: 999;
  }

  > .inner {
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    background: var(--yt-dark-bg);

    > .coin {
      margin-right: 5px;
    }
  
    > .timer {
      margin-right: 8px;
    }
  
    > .points {
      padding-right: 8px;
      font-size: 12px;
      font-family: var(--mm-font-family);
      color: var(--mm-color-text-bg-primary);
    }
  
    > .claim {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 2px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      background-color: var(--truffle-gradient);
  
      animation: claim-shake 2s infinite cubic-bezier(.36,.07,.19,.97) both;
      backface-visibility: hidden;
      transform-origin: bottom;
    }
  }



  @keyframes claim-shake {
    0% { transform: rotate(0); }
    40% { transform: rotate(1deg); }
    45% { transform: rotate(-5deg); }
    50% { transform: rotate(4deg); }
    52% { transform: rotate(-4deg); }
    56% { transform: rotate(2deg); }
    59% { transform: rotate(-2deg); }
    61% { transform: rotate(1deg); }
    100% { transform: rotate(0); }
  }
  
  

}

`