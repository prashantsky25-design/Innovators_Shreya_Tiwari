import React, { useState } from 'react';
import { PhotoItem } from '../types/index.js';
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';

interface PhotoLightboxProps {
  photos: PhotoItem[];
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photos }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openPhoto = (index: number) => setSelectedIndex(index);
  const closePhoto = () => setSelectedIndex(null);

  const prevPhoto = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  const nextPhoto = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No event photographs uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Responsive Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo, idx) => (
          <div
            key={photo._id || idx}
            onClick={() => openPhoto(idx)}
            className="group relative aspect-video sm:aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
          >
            <img
              src={photo.url}
              alt={photo.caption || `Event photo ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white">
              <Maximize2 className="w-5 h-5 drop-shadow" />
              {photo.caption && (
                <div className="absolute bottom-2 left-2 right-2 text-[11px] truncate text-slate-100 bg-slate-900/80 px-2 py-0.5 rounded">
                  {photo.caption}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="text-xs font-semibold text-slate-300">
              {selectedIndex + 1} of {photos.length}
            </div>
            <div className="flex items-center gap-3">
              <a
                href={photos[selectedIndex].url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                title="Download Photo"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={closePhoto}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image with Nav Arrows */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].caption || 'Event photo'}
              className="max-h-[78vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />

            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Caption Bar */}
          <div className="text-center text-xs text-slate-300 py-2">
            {photos[selectedIndex].caption || 'Official Event Photograph'}
          </div>
        </div>
      )}
    </>
  );
};
