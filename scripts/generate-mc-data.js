const fs = require('fs');
const path = require('path');
const md = require('minecraft-data');

const VERSION = '1.21';
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');
const ICON_BASE = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${VERSION}/assets/minecraft/textures`;

fs.mkdirSync(OUT_DIR, { recursive: true });

const data = md(VERSION);

// Items
const items = Object.values(data.itemsByName).map(item => ({
  id: item.id,
  name: item.name,
  displayName: item.displayName,
  stackSize: item.stackSize,
  maxDurability: item.maxDurability ?? null,
  enchantCategories: item.enchantCategories ?? [],
  repairWith: item.repairWith ?? [],
  iconUrl: `${ICON_BASE}/item/${item.name}.png`,
}));
fs.writeFileSync(path.join(OUT_DIR, 'items.json'), JSON.stringify(items));
console.log(`items.json: ${items.length} items`);

// Blocks
const blocks = Object.values(data.blocksByName).map(block => ({
  id: block.id,
  name: block.name,
  displayName: block.displayName,
  hardness: block.hardness,
  stackSize: block.stackSize,
  diggable: block.diggable,
  material: block.material ?? null,
  transparent: block.transparent,
  emitLight: block.emitLight,
  iconUrl: `${ICON_BASE}/block/${block.name}.png`,
}));
fs.writeFileSync(path.join(OUT_DIR, 'blocks.json'), JSON.stringify(blocks));
console.log(`blocks.json: ${blocks.length} blocks`);

// Recipes — resolve ingredient IDs to names
const itemById = data.items;
function resolveId(id) {
  return itemById[id]?.name ?? null;
}

const recipes = [];
for (const [itemId, recipeList] of Object.entries(data.recipes ?? {})) {
  for (const recipe of recipeList) {
    const shaped = recipe.inShape != null;
    recipes.push({
      resultId: Number(itemId),
      resultName: resolveId(Number(itemId)),
      resultCount: recipe.result?.count ?? 1,
      shaped,
      grid: shaped
        ? recipe.inShape.map(row =>
            row.map(id => (id ? resolveId(id) : null))
          )
        : null,
      ingredients: recipe.ingredients
        ? recipe.ingredients.map(id => resolveId(id))
        : null,
    });
  }
}
fs.writeFileSync(path.join(OUT_DIR, 'recipes.json'), JSON.stringify(recipes));
console.log(`recipes.json: ${recipes.length} recipes`);

console.log('Done →', OUT_DIR);
