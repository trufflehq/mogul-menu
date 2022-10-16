import { scss } from "../../../deps.ts";

export default scss`
.c-activity-list-item {
  position: relative;

  .header {
    > .type {
      font-size: 14px;
      font-weight: 700;
      line-height: 17px;
    }
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    line-height: 19px;
  }

  .description {
    font-size: 14px;
    font-weight: 400;
    line-height: 17px;
  }
}
`