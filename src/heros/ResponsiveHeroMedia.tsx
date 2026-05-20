import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'

import type { Page } from '@/payload-types'

type HeroMediaResource = Page['hero']['media']

type Props = {
  className?: string
  desktopMedia?: HeroMediaResource
  fill?: boolean
  imgClassName?: string
  mobileMedia?: HeroMediaResource
  priority?: boolean
}

export const ResponsiveHeroMedia = ({
  className,
  desktopMedia,
  fill,
  imgClassName,
  mobileMedia,
  priority,
}: Props) => {
  if (!desktopMedia || typeof desktopMedia !== 'object') return null

  if (!mobileMedia || typeof mobileMedia !== 'object') {
    return (
      <Media
        className={className}
        fill={fill}
        imgClassName={imgClassName}
        priority={priority}
        resource={desktopMedia}
      />
    )
  }

  return (
    <>
      <div className={cn(className, 'md:hidden')}>
        <Media
          fill={fill}
          imgClassName={imgClassName}
          priority={priority}
          resource={mobileMedia}
        />
      </div>
      <div className={cn(className, 'hidden md:block')}>
        <Media
          fill={fill}
          imgClassName={imgClassName}
          priority={priority}
          resource={desktopMedia}
        />
      </div>
    </>
  )
}
