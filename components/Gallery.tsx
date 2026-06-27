"use client";

import { useState } from "react";

type GalleryProps = {
  title: string;
  screenshots: string[];
  thumbnail: string;
  compact?: boolean;
};

export function Gallery({
  title,
  screenshots,
  thumbnail,
  compact = false,
}: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = screenshots.length > 0 ? screenshots : [thumbnail];
  const activeImage = images[activeIndex] ?? thumbnail;
  const hasRealScreenshots = screenshots.length > 0;

  if (!hasRealScreenshots) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#111] p-2">
        <div className="overflow-hidden rounded-lg bg-black/50">
          <img
            src={thumbnail}
            alt={`${title} preview image`}
            className={`w-full object-contain ${compact ? "aspect-[4/3] max-h-60" : "aspect-[16/9] lg:h-[450px]"}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "space-y-3"
          : "grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px]"
      }
    >
      <div className="panel-strong overflow-hidden rounded-xl p-2">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={`block h-full w-full overflow-hidden rounded-lg bg-black/40 text-left ${
            compact ? "max-w-3xl mx-auto" : ""
          }`}
        >
          <img
            src={activeImage}
            alt={`${title} screenshot ${activeIndex + 1}`}
            className={`${compact ? "aspect-[4/3] max-h-60 w-full object-contain" : "aspect-[16/9] lg:aspect-auto lg:h-[450px] w-full object-contain"} transition duration-300 hover:scale-[1.01]`}
          />
        </button>
      </div>

      {hasRealScreenshots && images.length > 1 ? (
        <div
          className={`${compact ? "flex gap-2 overflow-auto" : "flex flex-row overflow-x-auto lg:flex-col lg:overflow-y-auto lg:max-h-[450px] gap-2 content-start pr-1"}`}
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 overflow-hidden rounded-lg border transition ${
                index === activeIndex
                  ? "border-maroon-500/60 ring-1 ring-maroon-500/40"
                  : "border-[var(--border)] hover:border-white/20"
              }`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className={`${compact ? "h-20 w-auto" : "h-24 lg:h-32 w-36 lg:w-full object-cover"}`}
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image gallery`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-sm text-white transition hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            Close
          </button>
          <div
            className="max-h-[90vh] max-w-6xl overflow-hidden rounded-xl border border-[var(--border)] bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={`${title} screenshot ${activeIndex + 1} in fullscreen`}
              className="max-h-[90vh] w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
