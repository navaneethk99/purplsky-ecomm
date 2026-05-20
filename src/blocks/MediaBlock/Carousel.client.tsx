'use client'

import type { Media as MediaResource } from '@/payload-types'

import React from 'react'

import { Media } from '@/components/Media'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { RichText } from '@/components/RichText'
import { cn } from '@/utilities/cn'

type Props = {
  captionClassName?: string
  disableInnerContainer?: boolean
  images: MediaResource[]
  imgClassName?: string
}

const AUTOPLAY_DELAY = 4000

export const MediaBlockCarousel: React.FC<Props> = ({
  captionClassName,
  disableInnerContainer,
  images,
  imgClassName,
}) => {
  const [api, setApi] = React.useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const updateActiveIndex = () => {
      setActiveIndex(api.selectedScrollSnap())
    }

    updateActiveIndex()
    api.on('select', updateActiveIndex)
    api.on('reInit', updateActiveIndex)

    const interval = window.setInterval(() => {
      api.scrollNext()
    }, AUTOPLAY_DELAY)

    return () => {
      window.clearInterval(interval)
      api.off('select', updateActiveIndex)
      api.off('reInit', updateActiveIndex)
    }
  }, [api])

  const activeCaption = images[activeIndex]?.caption

  return (
    <>
      <Carousel className="w-full" opts={{ align: 'start', loop: true }} setApi={setApi}>
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <CarouselItem className="pl-0" key={image.id ?? index}>
              <div className="relative aspect-[4/3] md:aspect-[3/1] w-full overflow-hidden border border-border">
                <Media fill imgClassName={cn('object-cover', imgClassName)} resource={image} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <div className="flex items-center gap-4 rounded-full bg-black/15 px-4 py-2 backdrop-blur-sm">
              {images.map((_, index) => {
                const isActive = index === activeIndex

                return (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block h-3 rounded-full bg-white/60 transition-all duration-300',
                      isActive ? 'w-10 bg-white' : 'w-3',
                    )}
                    key={index}
                  />
                )
              })}
            </div>
          </div>
        )}
      </Carousel>
      {activeCaption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={activeCaption} enableGutter={false} />
        </div>
      )}
    </>
  )
}
