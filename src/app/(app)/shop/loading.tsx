import { Grid } from '@/components/Grid'
import React from 'react'

export default function Loading() {
  return (
    <Grid className="grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array(12)
        .fill(0)
        .map((_, index) => {
          return (
            <div
              className="overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground"
              key={index}
            >
              <div className="aspect-[4/5] animate-pulse bg-muted" />

              <div className="flex flex-col gap-3 px-4 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </div>

                <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/60 pt-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          )
        })}
    </Grid>
  )
}
