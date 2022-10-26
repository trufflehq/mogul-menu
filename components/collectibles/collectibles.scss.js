import { scss } from "../../deps.ts";

export default scss`
@mixin container($hasPadding: true) {
  width: 100%;
  max-width: 1260px;
  margin: 0 auto;
  box-sizing: border-box;

  @if $hasPadding {
    padding: 16px;
  }
}

.c-collectibles {
  @include container();

  >.type-section {
    margin-bottom: 40px;

    >.type {
      font-size: 16px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    >.collectibles {
      display: grid;
      grid-template-columns: repeat(auto-fit, 112px);
      justify-content: center;
      grid-gap: 32px;
    }
  }
}

.c-no-collectibles-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.c-no-collectibles {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;

  > img {
    display: block;
    margin: auto;
  }
}

.c-earn-collectibles {
  width: 400px;
  margin: 20px auto;
  padding: 24px 32px;
  background: var(--mm-color-bg-secondary);
  border-radius: 6px;

  > .heading {
    margin-bottom: 30px;
  }
}

.c-way-to-earn-collectibles {
  display: flex;
  gap: 15px;

  > .right {
    > .description {
      margin-bottom: 22px;
    }

    > .button {
      margin-bottom: 12px;
    }
  }

  &:not(:last-child) {
    > .right {
      >.ouc-link {
        margin-bottom: 28px;
      }
    }
  }
}
`;
