import { scss } from "../../../deps.ts";

export default scss`
.notifications-page-body {
  padding: 24px;

  .push-notifications {
    margin-bottom: 30px;
    .title {
      margin-bottom: 10px;

      .input {
        display: inline-block;
        margin: 0 10px;
      }
    }

    .description {
      margin-bottom: 5px;
    }
  }

  .notification-topics {
    .title {
      margin-bottom: 10px;
    }

    .description {
      margin-bottom: 24px;
    }

    .notification-topic-setting-rows {

      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .name {
          font-style: normal;
          font-weight: 500;
          font-size: 16px;
        }
      }

      .row:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
}
`;
