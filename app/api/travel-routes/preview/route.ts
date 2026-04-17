import { NextRequest, NextResponse } from 'next/server'

type LatLng = { lat: number; lng: number }

type OsrmRoute = {
  distance: number
  duration: number
  geometry: {
    coordinates: [number, number][]
  }
}

type OsrmResponse = {
  routes?: OsrmRoute[]
}

function downsample(points: LatLng[], maxPoints = 1800): LatLng[] {
  if (points.length <= maxPoints) return points
  const step = points.length / maxPoints
  const out: LatLng[] = []
  let i = 0
  while (Math.floor(i) < points.length) {
    out.push(points[Math.floor(i)])
    i += step
  }
  if (out[out.length - 1] !== points[points.length - 1]) {
    out.push(points[points.length - 1])
  }
  return out
}

function asLatLng(coords: [number, number][]): LatLng[] {
  return coords.map(([lng, lat]) => ({ lat, lng }))
}

async function fetchSegment(from: LatLng, to: LatLng) {
  const base = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org'
  const path = `/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}`
  const query = '?overview=full&geometries=geojson'

  const res = await fetch(`${base}${path}${query}`, {
    headers: { 'User-Agent': 'spotitforme/1.0' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`OSRM ${res.status}`)
  }

  const data = (await res.json()) as OsrmResponse
  const route = data.routes?.[0]
  if (!route) {
    throw new Error('No route')
  }

  return {
    geometry: asLatLng(route.geometry.coordinates),
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const points = Array.isArray(body?.points) ? (body.points as LatLng[]) : []

    if (points.length < 2) {
      return NextResponse.json({ error: 'En az 2 nokta gerekli.' }, { status: 400 })
    }

    let totalKm = 0
    let totalMin = 0
    const merged: LatLng[] = []

    for (let i = 0; i < points.length - 1; i += 1) {
      const from = points[i]
      const to = points[i + 1]

      try {
        const segment = await fetchSegment(from, to)
        totalKm += segment.distanceKm
        totalMin += segment.durationMin
        if (merged.length === 0) {
          merged.push(...segment.geometry)
        } else {
          merged.push(...segment.geometry.slice(1))
        }
      } catch {
        const fallback = i === 0 ? [from, to] : [to]
        merged.push(...fallback)
      }
    }

    return NextResponse.json({
      geometry: downsample(merged),
      distanceKm: Number(totalKm.toFixed(2)),
      durationMin: Math.max(1, Math.round(totalMin)),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Rota hesaplanamadi.' }, { status: 500 })
  }
}
