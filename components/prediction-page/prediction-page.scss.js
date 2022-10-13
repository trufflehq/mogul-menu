import { scss } from "../../deps.ts";

export default scss`
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

.c-predictions-page_footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  > .error {
    color: var(--error-red);
  }
}
.c-prediction-page_empty-predictions {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
}
`;
