import { scss } from "../../deps.ts";

export default scss`
.c-channel-points {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  flex: 1;
  cursor: pointer;

  align-items: center;
  border-right: none;
  box-sizing: border-box;

  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;

  .message {
    box-sizing: border-box;
    opacity: 0;
    height: 100%;
    background: linear-gradient(-45deg, #000000, #000000, #EBAD64, #ffffff00, #ffffff00, #ffffff00);
    margin: 1px 0px 1px 1px;
    background-size: 400% 400%;
		background-position: 0% 0%;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 10px;
    border-right: none;

    // background-color: red; 
  }

  > .channel-points {
    display: flex;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
    background-color: var(--bg-base);
    border-right: none;
    padding: 6px;
    z-index: 2;

    > .points {
      // padding-right: 10px;
      font-weight: 600;
      font-family: var(--mm-font-family);
      font-size: 14px;
    }
  }

  > .claim {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    pointer-events: none;
    height: 100%;
    z-index: 0;
    font-size: 14px;
    color: var(--mm-color-text-gradient);
    font-weight: 600;


    cursor: pointer;

    // background-color: var(--primary-base);

    padding: 12px 10px;
    transition: all .75s cubic-bezier(.25,.14,.5,1.0);

    > .icon {
      animation: claim-shake 2s infinite cubic-bezier(.36,.07,.19,.97) both;
      backface-visibility: hidden;
      transform-origin: bottom;
    }
  }
}

.c-collapsed-channel-points {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 100%;

  > .icon {
    animation: claim-shake 2s infinite cubic-bezier(.36,.07,.19,.97) both;
    backface-visibility: hidden;
    transform-origin: bottom;
  }
}

@keyframes gleam {
	0% {
		background-position: 0% 0%;
	}
	45% {
		background-position: 100% 50%;
	}
	55% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 0%;
	}
}

@keyframes scale-in-then-out {
  0% {
    transform: scale(0);
  }
  25% {
    transform: scale(1);
  }
  75% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

@keyframes fade-in-then-out {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
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
`;
