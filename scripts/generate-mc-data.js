const fs = require('fs');
const path = require('path');
const md = require('minecraft-data');

const VERSIONS = ['1.21.4','1.20.4','1.19.4','1.18.2','1.16.5','1.12.2','1.8.9'];

// InventivetalentDev texture version mapping (verified branches)
const TEXTURE_VERSION = {
  '1.21.4': '1.21.4', '1.20.4': '1.20.4', '1.19.4': '1.19.4',
  '1.18.2': '1.18.2', '1.16.5': '1.16.5', '1.12.2': '1.12.2', '1.8.9': '1.8'
};

const ICON_BASE = (ver, type, name) =>
  `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${TEXTURE_VERSION[ver]}/assets/minecraft/textures/${type}/${name}.png`;

for (const version of VERSIONS) {
  const outDir = path.join(__dirname, '..', 'public', 'data', version);
  fs.mkdirSync(outDir, { recursive: true });
  const data = md(version);

  // items
  const items = Object.values(data.itemsByName).map(item => ({
    id: item.id,
    name: item.name,
    displayName: item.displayName,
    stackSize: item.stackSize,
    maxDurability: item.maxDurability ?? null,
    iconUrl: `/icons/${version}/${item.name}.png`,
  }));
  fs.writeFileSync(path.join(outDir, 'items.json'), JSON.stringify(items));

  // recipes
  const itemById = data.items;
  const resolve = id => itemById[id]?.name ?? null;
  const recipes = [];
  for (const [itemId, list] of Object.entries(data.recipes ?? {})) {
    for (const r of list) {
      recipes.push({
        resultId: Number(itemId),
        resultName: resolve(Number(itemId)),
        resultCount: r.result?.count ?? 1,
        shaped: r.inShape != null,
        grid: r.inShape ? r.inShape.map(row => row.map(id => id ? resolve(id) : null)) : null,
        ingredients: r.ingredients ? r.ingredients.map(id => resolve(id)) : null,
      });
    }
  }
  fs.writeFileSync(path.join(outDir, 'recipes.json'), JSON.stringify(recipes));
  console.log(`${version}: ${items.length} items, ${recipes.length} recipes`);
}
console.log('Done');
