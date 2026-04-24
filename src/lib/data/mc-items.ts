import path from 'path'
import fs from 'fs'

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

export const SUPPORTED_VERSIONS = ['1.21.4','1.20.4','1.19.4','1.18.2','1.16.5','1.12.2','1.8.9'] as const
export type McVersion = typeof SUPPORTED_VERSIONS[number]
export const DEFAULT_VERSION: McVersion = '1.21.4'

export function getItems(version: McVersion = DEFAULT_VERSION): McItem[] {
  const p = path.join(process.cwd(), 'public', 'data', version, 'items.json')
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

export function getRecipes(version: McVersion = DEFAULT_VERSION): McRecipe[] {
  const p = path.join(process.cwd(), 'public', 'data', version, 'recipes.json')
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}
