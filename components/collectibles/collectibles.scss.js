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
      grid-gap: 32px;
    }
  }
}
`;