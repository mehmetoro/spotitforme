'use client'

import Image from 'next/image'

interface BrandMarkProps {
  className?: string
}

export default function BrandMark({ className = 'h-10 w-[160px]' }: BrandMarkProps) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-xl border border-slate-900/10 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] ${className}`}
    >
      <Image
        src="/spotitforme-log.png"
        alt="SpotItForMe logo"
        fill
        sizes="(max-width: 768px) 140px, 180px"
        className="object-contain p-1.5"
        priority
      />
    </div>
  )
}