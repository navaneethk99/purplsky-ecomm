'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Order } from '@/payload-types'
import Link from 'next/link'
import { ExternalLinkIcon, MapPinIcon } from 'lucide-react'

type ShippingAddress = NonNullable<Order['shippingAddress']>

type Coordinates = {
  latitude: number
  longitude: number
}

type Props = {
  address: ShippingAddress
}

const buildAddressQuery = (address: ShippingAddress) =>
  [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ')

const getBoundingBox = ({ latitude, longitude }: Coordinates) => {
  const latitudeOffset = 0.01
  const longitudeOffset = 0.01

  return [
    longitude - longitudeOffset,
    latitude - latitudeOffset,
    longitude + longitudeOffset,
    latitude + latitudeOffset,
  ].join(',')
}

export const DeliveryMap = ({ address }: Props) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const addressQuery = useMemo(() => buildAddressQuery(address), [address])
  const geocodeParams = useMemo(() => {
    const params = new URLSearchParams()

    if (address.addressLine1) params.set('addressLine1', address.addressLine1)
    if (address.addressLine2) params.set('addressLine2', address.addressLine2)
    if (address.city) params.set('city', address.city)
    if (address.state) params.set('state', address.state)
    if (address.postalCode) params.set('postalCode', address.postalCode)
    if (address.country) params.set('country', address.country)

    return params.toString()
  }, [address])

  useEffect(() => {
    let isCancelled = false

    const loadCoordinates = async () => {
      if (!addressQuery) {
        setError('No address is available for this order.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/geocode?${geocodeParams}`)
        const data = (await response.json()) as
          | Coordinates
          | {
              error?: string
            }
        const errorMessage = 'error' in data ? data.error : undefined

        if (!response.ok || !('latitude' in data) || !('longitude' in data)) {
          throw new Error(errorMessage || 'Unable to locate address.')
        }

        if (!isCancelled) {
          setCoordinates(data)
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setCoordinates(null)
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to locate address.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadCoordinates()

    return () => {
      isCancelled = true
    }
  }, [addressQuery, geocodeParams])

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border bg-muted/30">
        <div className="flex h-72 items-center justify-center px-6 text-sm text-muted-foreground">
          Loading delivery map...
        </div>
      </div>
    )
  }

  if (error || !coordinates) {
    return (
      <div className="overflow-hidden rounded-lg border bg-muted/30">
        <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
          <MapPinIcon className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error || 'Unable to locate address.'}</p>
        </div>
      </div>
    )
  }

  const boundingBox = getBoundingBox(coordinates)
  const marker = `${coordinates.latitude},${coordinates.longitude}`
  const embedURL = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(boundingBox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`
  const openStreetMapURL = `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=15/${coordinates.latitude}/${coordinates.longitude}`

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <iframe
        className="h-72 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={embedURL}
        title="Delivery location map"
      />
      <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium">
            <MapPinIcon className="size-4 text-primary" />
            Delivery location
          </p>
          <p className="truncate text-sm text-muted-foreground">{addressQuery}</p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline"
          href={openStreetMapURL}
          rel="noreferrer"
          target="_blank"
        >
          Open map
          <ExternalLinkIcon className="size-4" />
        </Link>
      </div>
    </div>
  )
}
