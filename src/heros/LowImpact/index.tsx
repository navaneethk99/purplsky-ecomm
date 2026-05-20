import React from 'react'

import type { Page } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { cn } from '@/utilities/cn'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      fillScreen?: boolean
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      fillScreen?: boolean
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({
  children,
  fillScreen,
  richText,
}) => {
  return (
    <div
      className={cn(
        'container mt-16',
        fillScreen && 'mt-0 flex min-h-[calc(100svh-5rem)] items-center',
      )}
    >
      <div className="max-w-3xl">
        {children || (richText && <RichText data={richText} enableGutter={false} />)}
      </div>
    </div>
  )
}
