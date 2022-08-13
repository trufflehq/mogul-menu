import { scss } from "../../deps.ts";

export default scss`
$ease-function: cubic-bezier(.4,.71,.18,.99);

.c-page-stack {
  /* 100% of the menu minus the tab bar height */
  height: calc(100% - 40px);
  width: 100%;
  min-height: 0;
  position: absolute;
  z-index: 5;
  
  > .container {
    width: 100%;
    height: 100%;
    position: relative;
    
    > .page {
      width: 100%;
      height: 100%;
      position: absolute;
      background: var(--background);
      animation: animatebottom 0.4s $ease-function;
      @keyframes animatebottom{
        from {
          transform: translateY(100px);
          opacity:0
        }
    
        to {
          transform: translateY(0);
          opacity:1
        }
      }
    }
  }
  
}
`;
