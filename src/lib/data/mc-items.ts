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

export function getItems(): McItem[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'items.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function getRecipes(): McRecipe[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'recipes.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function getItemMap(): Map<string, McItem> {
  const items = getItems()
  return new Map(items.map(i => [i.name, i]))
}
