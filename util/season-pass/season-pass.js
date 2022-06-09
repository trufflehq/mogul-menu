import _ from 'https://esm.sh/lodash'

export function getLevelBySeasonPassAndXp (seasonPass, xp) {
  const currentXp = xp?.count ? xp.count : 0

  const lastLevel = _.findLast(seasonPass.levels, ({ minXp }) =>
    currentXp >= minXp
  )

  return lastLevel
}

export function getXPBarBySeasonPassAndXp (seasonPass, xp) {
  const currentXp = xp?.count ? parseInt(xp.count) : 0

  const floor = _.findLast(seasonPass.levels, ({ minXp }) =>
    currentXp >= minXp
  ) ?? 0

  const ceiling = _.find(seasonPass.levels, ({ minXp }) => currentXp < minXp)

  if (!ceiling) {
    const ceiling = seasonPass.levels[seasonPass.levels.length - 1]

    const range = parseInt(ceiling?.minXp) - parseInt(seasonPass.levels[seasonPass.levels.length - 2].minXp)
    const progress = range

    return { range, progress }
  }

  const floorMinXp = floor?.minXp ? parseInt(floor?.minXp) : 0
  const range = parseInt(ceiling?.minXp) - floorMinXp

  const progress = currentXp - floorMinXp

  return { range, progress }
}
