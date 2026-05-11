'use client';
import { useState } from 'react';

export default function VenueCard({ venue }) {
  const [imgErrors, setImgErrors] = useState({});

  if (!venue) return null;

  const { name, rating, reviewCount, price, categories, address,
          hours, isOpen, photos, mapsUrl, website } = venue;

  const validPhotos = (photos || []).filter((_, i) => !imgErrors[i]);

  return (
    <div className="mt-3 bg-white border border-pk-border rounded-xl overflow-hidden hover:border-pk-accent transition-colors group cursor-pointer"
      onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
    >
      {/* Photo strip */}
      {validPhotos.length > 0 && (
        <div className="flex gap-0.5 h-36 overflow-hidden">
          {validPhotos.slice(0, 3).map((photo, i) => (
            <div key={i} className={`flex-1 overflow-hidden ${i > 0 ? 'hidden sm:block' : ''}`}>
              <img
                src={photo}
                alt={`${name} photo ${i + 1}`}
                className="w-full h-full object-cover"
                onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )}

      {validPhotos.length === 0 && (
        <div className="h-20 bg-pk-accent-lt flex items-center justify-center">
          <span className="text-pk-text3 text-xs">No photos available</span>
        </div>
      )}

      <div className="px-3.5 py-3">
        {/* Name + status + price */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-sm font-medium text-pk-text group-hover:text-pk-accent transition-colors leading-tight">
            {name}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {price && <span className="text-[11px] text-pk-text2 font-medium">{price}</span>}
            {isOpen !== null && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>

        {/* Stars */}
        {rating && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-3 h-3" viewBox="0 0 20 20"
                  fill={i <= Math.round(rating) ? '#C4607A' : '#F0D0DC'}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-pk-text2">
              {rating}{reviewCount ? ` (${reviewCount.toLocaleString()})` : ''}
            </span>
          </div>
        )}

        {/* Category + hours */}
        <div className="flex items-center flex-wrap gap-1.5 mb-1">
          {categories && <span className="text-[11px] text-pk-text3">{categories}</span>}
          {hours && (
            <>
              <span className="text-pk-text3 text-[10px]">·</span>
              <span className="text-[11px] text-pk-text3">{hours}</span>
            </>
          )}
        </div>

        {address && <p className="text-[11px] text-pk-text3 mb-2">{address}</p>}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-1 border-t border-pk-border">
          <span className="text-[10px] text-pk-accent group-hover:underline">Open in Maps →</span>
          {website && (
            <span
              onClick={e => { e.stopPropagation(); window.open(website, '_blank', 'noopener,noreferrer'); }}
              className="text-[10px] text-pk-text3 hover:text-pk-accent hover:underline cursor-pointer"
            >
              Website
            </span>
          )}
        </div>
      </div>
    </div>
  );
}