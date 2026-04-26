"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [main, ...rest] = images;
  const secondary = rest.slice(0, 2);
  const tertiary = rest[2];

  return (
    <>
      {/* Desktop gallery — hidden on mobile */}
      <div className="hidden md:flex flex-col gap-2">
        {/* Main image */}
        <div className="relative w-full aspect-[4/5] bg-surface-low overflow-hidden rounded-[4px]">
          <Image
            src={images[active].src}
            alt={images[active].alt}
            fill
            priority
            className="object-cover object-top"
            sizes="55vw"
          />
        </div>

        {/* Secondary row */}
        {secondary.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {secondary.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i + 1)}
                className={`relative aspect-square bg-surface-low overflow-hidden rounded-[4px] transition-opacity ${
                  active === i + 1 ? "ring-1 ring-primary/40" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover object-center" sizes="27vw" />
              </button>
            ))}
          </div>
        )}

        {/* Tertiary full-width */}
        {tertiary && (
          <button
            onClick={() => setActive(3)}
            className={`relative w-full aspect-[4/5] bg-surface-low overflow-hidden rounded-[4px] transition-opacity ${
              active === 3 ? "ring-1 ring-primary/40" : "opacity-80 hover:opacity-100"
            }`}
          >
            <Image src={tertiary.src} alt={tertiary.alt} fill className="object-cover object-top" sizes="55vw" />
          </button>
        )}
      </div>

      {/* Mobile gallery — stacked full-width */}
      <div className="md:hidden flex flex-col">
        {images.map((img, i) => (
          <div key={i} className="relative w-full aspect-[4/5] bg-surface-low">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </div>
        ))}
      </div>
    </>
  );
}
