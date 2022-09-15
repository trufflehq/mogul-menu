import { scss } from "../../../deps.ts";


export default scss`
.c-activity-banner-fragment {
  display: flex;
  gap: 12px;
  width: 100%;

  > .icon {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  > .content {

    > .title {
      color: var(--mm-color-text-demphasized);
      font-size: 12px;
      font-weight: 400;
    }
  }

  > .action {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    align-items: center;
  }

  > .progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.c-activity-banner-icon {
  width: 24px;
  height: 24px;
}

.c-activity-banner-info {
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 14px;
  color: var(--mm-color-text-bg-primary);
  gap: 4px;
}

.c-activity-banner-secondary-info {
  color: var(--mm-color-opt-3);
}
`