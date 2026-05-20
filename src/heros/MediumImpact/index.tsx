import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { RichText } from '@/components/RichText'
import { ResponsiveHeroMedia } from '@/heros/ResponsiveHeroMedia'
import { cn } from '@/utilities/cn'

type MediumImpactHeroProps = Page['hero'] & {
  fillScreen?: boolean
}

export const MediumImpactHero: React.FC<MediumImpactHeroProps> = ({
  fillScreen,
  links,
  media,
  mobileMedia,
  richText,
}) => {
  const hasMedia = media && typeof media === 'object'
  const mediaResource = hasMedia ? media : null

  if (mediaResource) {
    return (
      <div
        className={cn('relative', fillScreen ? 'min-h-screen' : 'container')}
        data-theme="dark"
      >
        <ResponsiveHeroMedia
          className={cn(
            fillScreen ? 'absolute inset-0 h-full w-full' : 'relative block overflow-hidden',
          )}
          desktopMedia={mediaResource}
          fill
          imgClassName={cn(
            'object-cover',
            !fillScreen && 'rounded-[0.8rem] border border-border',
          )}
          mobileMedia={mobileMedia}
          priority
        />
        <div
          className={cn(
            'absolute inset-0',
            fillScreen ? 'bg-black/20' : 'rounded-[0.8rem] bg-black/25',
          )}
        />
        <div
          className={cn(
            'relative z-10 flex items-end',
            fillScreen
              ? 'container min-h-[calc(100svh-5rem)] pb-10 md:pb-14'
              : 'min-h-[26rem] p-6 md:p-10',
          )}
        >
          <div className="max-w-2xl text-white">
            {richText && <RichText className="mb-5" data={richText} enableGutter={false} />}
            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex gap-3">
                {links.map(({ link }, i) => {
                  return (
                    <li key={i}>
                      <CMSLink
                        {...link}
                        className={cn(
                          'border-white/35 bg-white/10 text-white shadow-none backdrop-blur-sm hover:bg-white hover:text-black',
                        )}
                        size="sm"
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
        {mediaResource.caption && !fillScreen && (
          <div className="mt-3">
            <RichText data={mediaResource.caption} enableGutter={false} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="">
      <div className="container mb-8">
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} size="sm" />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="container">
        {media && typeof media === 'object' && (
          <div>
            <ResponsiveHeroMedia
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              desktopMedia={media}
              imgClassName=""
              mobileMedia={mobileMedia}
              priority
            />
            {media.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
