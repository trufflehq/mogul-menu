import { scss } from "../../../deps.ts";

export default scss`
@mixin flex-column {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.c-oauth-connection-page{
  @include flex-column;
  
  box-sizing: border-box;
  padding: 48px 32px;

  > .info {
    @include flex-column;

    align-items: center;
    justify-content: center; 
    text-align: center;
    font-size: 16px;
    margin-top: 40px;
    font-weight: bold;
    color: var(--mm-color-text-bg-primary);
  }

  .oauth-button {
    display: flex;
    align-items: center;
    max-width: 308px;
    box-sizing: border-box;
    margin: 20px auto;
    padding: 12px, 20px, 12px, 20px;
    height: 42px;
    gap: 8px;
  }

  .youtube {
    background: rgba(235, 50, 25, 1);
  }

  .policies {
    margin: 0 auto;
  }
}
`;
