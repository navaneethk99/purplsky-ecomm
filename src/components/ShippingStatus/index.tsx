import { cn } from '@/utilities/cn'
import { CheckIcon } from 'lucide-react'

type ShippingStatusValue = 'delivered' | 'packed' | 'pending' | 'shipped' | null | undefined

type Props = {
  className?: string
  status: ShippingStatusValue
  trackingNumber?: null | string
  variant?: 'compact' | 'full'
}

const steps = [
  { label: 'Placed', value: 'pending' },
  { label: 'Packed', value: 'packed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
] as const

export const ShippingStatus: React.FC<Props> = ({
  className,
  status,
  trackingNumber,
  variant = 'full',
}) => {
  if (!status) {
    return null
  }

  const activeIndex = steps.findIndex((step) => step.value === status)
  const currentStep = steps[activeIndex] || steps[0]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/*<div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-primary/50">
          Fulfillment
        </span>
        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-primary">
          {currentStep.label}
        </span>
      </div>*/}

      <ol
        className={cn('grid gap-2', {
          'grid-cols-4 max-w-md': variant === 'full',
          'grid-cols-4 max-w-xs': variant === 'compact',
        })}
      >
        {steps.map((step, index) => {
          const isComplete = index <= activeIndex
          const isCurrent = index === activeIndex

          return (
            <li className="relative flex min-w-0 flex-col gap-2" key={step.value}>
              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    'absolute left-[calc(50%+0.5rem)] top-2 h-px w-[calc(100%-1rem)]',
                    isComplete ? 'bg-primary' : 'bg-border',
                  )}
                />
              ) : null}

              <span
                className={cn(
                  'relative z-10 mx-auto flex size-4 items-center justify-center rounded-full border bg-background',
                  isComplete
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border',
                  isCurrent && 'ring-2 ring-primary/25',
                )}
              >
                {isComplete ? <CheckIcon className="size-3" /> : null}
              </span>

              <span
                className={cn('truncate text-center font-mono uppercase text-muted-foreground', {
                  'text-[10px]': variant === 'compact',
                  'text-xs': variant === 'full',
                  'text-foreground': isCurrent,
                })}
              >
                {variant === 'compact' && step.value === 'pending' ? 'Placed' : step.label}
              </span>
            </li>
          )
        })}
      </ol>

      {trackingNumber ? (
        <p className="text-sm text-muted-foreground">
          Tracking: <span className="font-mono text-foreground">{trackingNumber}</span>
        </p>
      ) : null}
    </div>
  )
}
