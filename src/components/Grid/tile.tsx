import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { Label } from '@/components/Grid/Label'
import clsx from 'clsx'
import React from 'react'

type Props = {
  active?: boolean
  isInteractive?: boolean
  label?: {
    amount: number
    originalAmount?: number | null
    position?: 'bottom' | 'center'
    title: string
  }
  media: MediaType
}

export const GridTileImage: React.FC<Props> = ({
  active,
  isInteractive = true,
  label,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'group relative flex aspect-square h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
        {
          'border-2 border-blue-600': active,
          'border-neutral-200 dark:border-neutral-800': !active,
          relative: label,
        },
      )}
    >
      {props.media ? (
        <Media
          className="relative h-full w-full"
          fill
          imgClassName={clsx('h-full w-full object-cover', {
            'transition duration-300 ease-in-out group-hover:scale-105': isInteractive,
          })}
          resource={props.media}
        />
      ) : null}
      {label ? (
        <Label
          amount={label.amount}
          originalAmount={label.originalAmount}
          position={label.position}
          title={label.title}
        />
      ) : null}
    </div>
  )
}
