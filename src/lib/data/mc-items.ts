export type McItem = {
  id: number
  name: string
  displayName: string
  stackSize: number
  maxDurability: number | null
  iconUrl: string
}

export type McRecipe = {
  resultId: number
  resultName: string
  resultCount: number
  shaped: boolean
  grid: (string | null)[][] | null
  ingredients: (string | null)[] | null
}

export type SmeltingRecipe = {
  from: string[]
  tool: string
  alt_tool?: string
  xp: number
}

export type InteractionRecipe = {
  base: string
  tool?: string
  method: 'use' | 'craft' | 'natural'
  note?: string
}

export const SUPPORTED_VERSIONS = ['1.21.4','1.20.4','1.19.4','1.18.2','1.16.5','1.12.2','1.8.9'] as const
export type McVersion = typeof SUPPORTED_VERSIONS[number]
export const DEFAULT_VERSION: McVersion = '1.21.4'

/** Items hidden from the dictionary (non-existent or technical blocks). */
export const HIDDEN_ITEMS = new Set([
  'air',
  'cave_air',
  'void_air',
])

/** Detect if a 3x3 shaped recipe fits in a 2x2 area (third row + third col empty). */
export function is2x2Recipe(grid: (string | null)[][] | null): boolean {
  if (!grid || grid.length !== 3) return false
  const thirdRowEmpty = grid[2].every(c => c === null)
  const thirdColEmpty = grid.every(row => row[2] === null)
  return thirdRowEmpty && thirdColEmpty
}
