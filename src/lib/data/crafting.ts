export type CraftingSlot = string | null // item name or empty slot

export type Recipe = {
  id: string
  name: string
  nameKo: string
  category: 'tools' | 'weapons' | 'armor' | 'building' | 'food' | 'redstone' | 'misc'
  output: { item: string; count: number }
  grid: [
    [CraftingSlot, CraftingSlot, CraftingSlot],
    [CraftingSlot, CraftingSlot, CraftingSlot],
    [CraftingSlot, CraftingSlot, CraftingSlot],
  ]
  shapeless?: boolean
  description: string
}

export const RECIPES: Recipe[] = [
  {
    id: 'diamond-sword',
    name: 'Diamond Sword',
    nameKo: '다이아몬드 검',
    category: 'weapons',
    output: { item: 'diamond_sword', count: 1 },
    grid: [
      [null, 'Diamond', null],
      [null, 'Diamond', null],
      [null, 'Stick', null],
    ],
    description: '공격력 7. 내구도 1561. 최고 수준의 검.',
  },
  {
    id: 'diamond-pickaxe',
    name: 'Diamond Pickaxe',
    nameKo: '다이아몬드 곡괭이',
    category: 'tools',
    output: { item: 'diamond_pickaxe', count: 1 },
    grid: [
      ['Diamond', 'Diamond', 'Diamond'],
      [null, 'Stick', null],
      [null, 'Stick', null],
    ],
    description: '흑요석 등 모든 블록 채굴 가능. 내구도 1561.',
  },
  {
    id: 'crafting-table',
    name: 'Crafting Table',
    nameKo: '제작대',
    category: 'building',
    output: { item: 'crafting_table', count: 1 },
    grid: [
      ['Wooden Planks', 'Wooden Planks', null],
      ['Wooden Planks', 'Wooden Planks', null],
      [null, null, null],
    ],
    description: '3x3 제작 격자를 여는 기본 도구. 첫 번째로 만들어야 할 아이템.',
  },
  {
    id: 'chest',
    name: 'Chest',
    nameKo: '상자',
    category: 'building',
    output: { item: 'chest', count: 1 },
    grid: [
      ['Wooden Planks', 'Wooden Planks', 'Wooden Planks'],
      ['Wooden Planks', null, 'Wooden Planks'],
      ['Wooden Planks', 'Wooden Planks', 'Wooden Planks'],
    ],
    description: '27칸 저장. 두 개 붙이면 대형 상자(54칸).',
  },
  {
    id: 'furnace',
    name: 'Furnace',
    nameKo: '화로',
    category: 'building',
    output: { item: 'furnace', count: 1 },
    grid: [
      ['Cobblestone', 'Cobblestone', 'Cobblestone'],
      ['Cobblestone', null, 'Cobblestone'],
      ['Cobblestone', 'Cobblestone', 'Cobblestone'],
    ],
    description: '제련, 굽기에 필수. 조약돌 8개로 제작.',
  },
  {
    id: 'bow',
    name: 'Bow',
    nameKo: '활',
    category: 'weapons',
    output: { item: 'bow', count: 1 },
    grid: [
      [null, 'Stick', 'String'],
      ['Stick', null, 'String'],
      [null, 'Stick', 'String'],
    ],
    description: '원거리 무기. 화살과 함께 사용. 인챈트로 강화 가능.',
  },
  {
    id: 'bread',
    name: 'Bread',
    nameKo: '빵',
    category: 'food',
    output: { item: 'bread', count: 1 },
    grid: [
      [null, null, null],
      ['Wheat', 'Wheat', 'Wheat'],
      [null, null, null],
    ],
    shapeless: false,
    description: '허기 5 + 포만감 6 회복. 밀 3개로 간단 제작.',
  },
  {
    id: 'golden-apple',
    name: 'Golden Apple',
    nameKo: '황금 사과',
    category: 'food',
    output: { item: 'golden_apple', count: 1 },
    grid: [
      ['Gold Ingot', 'Gold Ingot', 'Gold Ingot'],
      ['Gold Ingot', 'Apple', 'Gold Ingot'],
      ['Gold Ingot', 'Gold Ingot', 'Gold Ingot'],
    ],
    description: '재생 II (5초) + 흡수 I (2분). 황금 괴 8개 + 사과 1개.',
  },
  {
    id: 'enchanting-table',
    name: 'Enchanting Table',
    nameKo: '인챈트 테이블',
    category: 'misc',
    output: { item: 'enchanting_table', count: 1 },
    grid: [
      [null, 'Book', null],
      ['Diamond', 'Obsidian', 'Diamond'],
      ['Obsidian', 'Obsidian', 'Obsidian'],
    ],
    description: '경험치를 소모해 아이템을 인챈트. 주변 책장으로 레벨 강화(최대 30레벨).',
  },
  {
    id: 'shield',
    name: 'Shield',
    nameKo: '방패',
    category: 'armor',
    output: { item: 'shield', count: 1 },
    grid: [
      ['Wooden Planks', 'Iron Ingot', 'Wooden Planks'],
      ['Wooden Planks', 'Wooden Planks', 'Wooden Planks'],
      [null, 'Wooden Planks', null],
    ],
    description: '막기로 대부분의 근접/원거리 피해 차단. Java Edition 필수 장비.',
  },
  {
    id: 'elytra',
    name: 'Elytra',
    nameKo: '엘리트라',
    category: 'misc',
    output: { item: 'elytra', count: 1 },
    grid: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    shapeless: true,
    description: '날개 달린 갑옷. 엔드 선박에서만 획득 가능 (제작 불가). 불꽃놀이와 함께 비행.',
  },
  {
    id: 'beacon',
    name: 'Beacon',
    nameKo: '비콘',
    category: 'misc',
    output: { item: 'beacon', count: 1 },
    grid: [
      ['Glass', 'Glass', 'Glass'],
      ['Glass', 'Nether Star', 'Glass'],
      ['Obsidian', 'Obsidian', 'Obsidian'],
    ],
    description: '네더 별 + 유리 5 + 흑요석 3. 범위 버프 제공. 피라미드 구조 필요.',
  },
  {
    id: 'sticky-piston',
    name: 'Sticky Piston',
    nameKo: '점착 피스톤',
    category: 'redstone',
    output: { item: 'sticky_piston', count: 1 },
    grid: [
      ['Slimeball', null, null],
      ['Piston', null, null],
      [null, null, null],
    ],
    shapeless: true,
    description: '블록을 밀고 당기는 레드스톤 장치. 점액구슬 + 피스톤.',
  },
  {
    id: 'iron-armor-helmet',
    name: 'Iron Helmet',
    nameKo: '철 헬멧',
    category: 'armor',
    output: { item: 'iron_helmet', count: 1 },
    grid: [
      ['Iron Ingot', 'Iron Ingot', 'Iron Ingot'],
      ['Iron Ingot', null, 'Iron Ingot'],
      [null, null, null],
    ],
    description: '방어력 +2. 내구도 165. 철 갑옷 세트의 일부.',
  },
]
