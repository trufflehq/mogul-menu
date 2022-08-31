import { scss } from "../../../deps.ts";

export default scss`
.c-oauth-connection-page{
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 48px 32px;

  > .info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; 
    text-align: center;
    font-size: 20px;
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
}
`;
