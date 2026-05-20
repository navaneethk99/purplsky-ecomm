import { NextRequest, NextResponse } from 'next/server'

type NominatimResult = {
  lat: string
  lon: string
}

const getAddressFields = (request: NextRequest) => ({
  addressLine1: request.nextUrl.searchParams.get('addressLine1')?.trim() || '',
  addressLine2: request.nextUrl.searchParams.get('addressLine2')?.trim() || '',
  city: request.nextUrl.searchParams.get('city')?.trim() || '',
  state: request.nextUrl.searchParams.get('state')?.trim() || '',
  postalCode: request.nextUrl.searchParams.get('postalCode')?.trim() || '',
  country: request.nextUrl.searchParams.get('country')?.trim() || '',
})

const buildSearchParams = ({
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country,
}: ReturnType<typeof getAddressFields>) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
  })

  const street = [addressLine1, addressLine2].filter(Boolean).join(', ')

  if (street) params.set('street', street)
  if (city) params.set('city', city)
  if (state) params.set('state', state)
  if (postalCode) params.set('postalcode', postalCode)
  if (country) params.set('countrycodes', country.toLowerCase())

  return params
}

const buildFreeTextSearchParams = (parts: string[]) => {
  const query = parts.filter(Boolean).join(', ')

  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
  })

  if (query) {
    params.set('q', query)
  }

  return params
}

const buildPostalFirstSearchParams = ({
  city,
  state,
  postalCode,
  country,
}: ReturnType<typeof getAddressFields>) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
  })

  if (postalCode) params.set('postalcode', postalCode)
  if (city) params.set('city', city)
  if (state) params.set('state', state)
  if (country) params.set('countrycodes', country.toLowerCase())

  return params
}

const fetchCoordinates = async (searchParams: URLSearchParams) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${searchParams}`, {
    headers: {
      'accept-language': 'en',
      'user-agent': 'ecommerce-order-map/1.0',
    },
    next: {
      revalidate: 60 * 60 * 24,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to geocode address.')
  }

  const results = (await response.json()) as NominatimResult[]

  return results[0] || null
}

export async function GET(request: NextRequest) {
  const addressFields = getAddressFields(request)
  const hasAddress = Object.values(addressFields).some(Boolean)

  if (!hasAddress) {
    return NextResponse.json({ error: 'Address is required.' }, { status: 400 })
  }

  try {
    const attempts = [
      buildSearchParams(addressFields),
      buildFreeTextSearchParams([
        addressFields.addressLine1,
        addressFields.addressLine2,
        addressFields.city,
        addressFields.state,
        addressFields.postalCode,
        addressFields.country,
      ]),
      buildSearchParams({
        ...addressFields,
        addressLine2: '',
      }),
      buildFreeTextSearchParams([
        addressFields.addressLine1,
        addressFields.city,
        addressFields.state,
        addressFields.postalCode,
        addressFields.country,
      ]),
      buildFreeTextSearchParams([
        addressFields.addressLine2,
        addressFields.city,
        addressFields.state,
        addressFields.postalCode,
        addressFields.country,
      ]),
      buildPostalFirstSearchParams(addressFields),
      buildPostalFirstSearchParams({
        ...addressFields,
        city: '',
      }),
      buildPostalFirstSearchParams({
        ...addressFields,
        city: '',
        state: '',
      }),
      buildSearchParams({
        ...addressFields,
        addressLine1: '',
        addressLine2: '',
      }),
    ]

    let match: NominatimResult | null = null

    for (const searchParams of attempts) {
      if (![...searchParams.keys()].some((key) => key !== 'format' && key !== 'limit')) {
        continue
      }

      match = await fetchCoordinates(searchParams)

      if (match) {
        break
      }
    }

    if (!match) {
      return NextResponse.json({ error: 'Address not found.' }, { status: 404 })
    }

    return NextResponse.json({
      latitude: Number(match.lat),
      longitude: Number(match.lon),
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json({ error: 'Unable to geocode address.' }, { status: 502 })
  }
}
