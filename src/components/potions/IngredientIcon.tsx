type Props = {
  iconKey: string
  label?: string
  size?: number
}

export function IngredientIcon({ iconKey, label, size = 24 }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <img
        src={`/icons/1.21.4/${iconKey}.png`}
        alt={label ?? iconKey}
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated', width: size, height: size }}
        className="shrink-0"
      />
      {label && <span className="text-xs text-foreground-muted">{label}</span>}
    </div>
  )
}
