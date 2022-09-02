import { scss } from "../../../deps.ts";

export default scss`
.c-chat-settings-page{
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  box-sizing: border-box;
  padding: 48px 74px;


  > .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; 
    text-align: center;
    color: var(--mm-color-text-bg-primary);
    
    > .title {
      margin-top: 8px;
      font-size: 36px;
      font-weight: 700;
    }

    > .welcome {
      margin-top: 24px;
      font-weight: 700;
      font-size: 20px;
    }

    > .info {
      margin-top: 4px;
      font-weight: 400;
      font-size: 16px;
    }

  }
  
  > .settings {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    margin-top: 40px;

    > .username {
      width: 100%;

      > .label {
        display: flex;
        width: 100%;
        font-size: 14px;
      }
    }
  }

  > footer {
    display: flex;
    justify-content: flex-end;
  }
}
`;
