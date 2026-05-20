import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import type { Media as MediaResource, MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { MediaBlockCarousel } from './Carousel.client'

export const MediaBlock: React.FC<
  MediaBlockProps & {
    id?: string | number
    breakout?: boolean
    captionClassName?: string
    className?: string
    enableGutter?: boolean
    imgClassName?: string
    staticImage?: StaticImageData
    disableInnerContainer?: boolean
  }
> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    mediaItems,
    staticImage,
    disableInnerContainer,
  } = props

  const carouselImages = (mediaItems ?? [])
    .map((item) => (typeof item.image === 'object' ? (item.image as MediaResource) : null))
    .filter((item): item is MediaResource => item !== null)

  if (carouselImages.length > 1) {
    return (
      <div
        className={cn(
          '',
          {
            container: enableGutter,
          },
          className,
        )}
      >
        <MediaBlockCarousel
          captionClassName={captionClassName}
          disableInnerContainer={disableInnerContainer}
          images={carouselImages}
          imgClassName={imgClassName}
        />
      </div>
    )
  }

  const singleMedia = carouselImages[0] ?? (typeof media === 'object' ? media : null)
  const caption = singleMedia?.caption

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      <Media
        imgClassName={cn('border border-border rounded-[0.8rem]', imgClassName)}
        resource={singleMedia ?? media}
        src={staticImage}
      />
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
