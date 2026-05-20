'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { RichText } from '@/components/RichText'
import { ResponsiveHeroMedia } from '@/heros/ResponsiveHeroMedia'
import { StartShoppingButton } from '@/components/StartShoppingButton'
import { cn } from '@/utilities/cn'

type HighImpactHeroProps = Page['hero'] & {
  fillScreen?: boolean
}

export const HighImpactHero: React.FC<HighImpactHeroProps> = ({
  fillScreen,
  links,
  media,
  mobileMedia,
  richText,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className={cn('relative flex min-h-screen items-center justify-center text-white -mt-[7vh]')}
      data-theme="dark"
    >
      <div className="container z-10 mb-8 relative flex items-center justify-center">
        <div className="max-w-146 md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4 md:justify-center">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      className="border-white/35 bg-white/10 text-white shadow-none backdrop-blur-sm hover:bg-white hover:text-black"
                      size="sm"
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center px-4 md:bottom-12">
        <StartShoppingButton className="pointer-events-auto" />
      </div>
      <div className="absolute inset-0 select-none">
        <ResponsiveHeroMedia
          className="relative h-full w-full"
          desktopMedia={media}
          fill
          imgClassName="object-fill"
          mobileMedia={mobileMedia}
          priority
        />
      </div>
    </div>
  )
}
