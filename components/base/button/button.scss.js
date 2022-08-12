import { scss } from "../../../deps.ts";

export default scss`
.c-button {
  background: var(--background);
  color: var(--text-color);
  outline: 1px solid var(--border-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 8px 16px;
  transition: all linear 50ms;
  font-family: var(--mm-font-family);
  font-weight: var(--font-weight);
  font-size: var(--font-size);

  &:hover {
    filter: brightness(80%);
  }

  &:disabled {
    filter: brightness(80%);
    cursor: not-allowed;
  }
}
`;