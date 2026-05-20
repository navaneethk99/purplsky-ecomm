import React from 'react'

type Props = {
  items?: number
  showTitle?: boolean
  title: string
}

export function SidebarFilterSkeleton({ items = 6, showTitle = true, title }: Props) {
  return (
    <div className="w-full rounded-lg border border-border/60 bg-card p-4 text-card-foreground">
      {showTitle ? (
        <div className="mb-4 h-3 w-20 animate-pulse rounded bg-muted" aria-label={title} />
      ) : null}

      <div className="space-y-3">
        {Array.from({ length: items }).map((_, index) => (
          <div
            className="h-4 animate-pulse rounded bg-muted"
            key={index}
            style={{
              width: `${Math.max(45, 100 - index * 8)}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
