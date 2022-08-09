import { scss } from "../../../deps.ts";

export default scss`
.c-username-gradient-body {
  padding: 12px 24px 0px 24px;

  .gradient-option {
    display: flex;
    align-items: center;
    gap: 10px;

    .preview {
      width: 24px;
      height: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 100%;
      background: var(--background);
    }
  }
}
`;
