import React, { useState, useEffect } from 'react';
import { PropertyMediaSummary } from '@housing-clone/shared';
import { Image, ChevronLeft, ChevronRight, X, Maximize2, Play, FileText } from 'lucide-react';

interface PropertyGalleryProps {
  media: PropertyMediaSummary[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ media, title }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = media.filter((m) => m.mediaType === 'IMAGE');
  const floorPlans = media.filter((m) => m.mediaType === 'FLOOR_PLAN');
  const videos = media.filter((m) => m.mediaType === 'VIDEO');

  const defaultImage =
    images.length > 0
      ? images[0].url
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  return (
    <div className="space-y-4">
      {/* Primary Hero Grid (Desktop 2-column or 5-photo grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100 relative">
        {/* Main Featured Photo */}
        <div
          onClick={() => setLightboxIndex(0)}
          className="md:col-span-2 h-72 sm:h-96 relative cursor-pointer group overflow-hidden"
        >
          <img
            src={defaultImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <button
            type="button"
            className="absolute bottom-4 left-4 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center space-x-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>View All ({images.length || 1} Photos)</span>
          </button>
        </div>

        {/* Secondary Thumbnail Grid */}
        <div className="hidden md:grid grid-cols-2 gap-2 h-96">
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setLightboxIndex(idx + 1)}
              className="relative cursor-pointer group overflow-hidden h-full bg-gray-200"
            >
              <img
                src={img.thumbnailUrl || img.url}
                alt={`${title} photo ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
          {images.length < 5 &&
            Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
              <div key={i} className="bg-gray-200 flex items-center justify-center text-gray-400">
                <Image className="w-8 h-8 opacity-40" />
              </div>
            ))}
        </div>
      </div>

      {/* Floor Plan & Video Tab Badges */}
      {(floorPlans.length > 0 || videos.length > 0) && (
        <div className="flex items-center space-x-3 text-xs font-bold">
          {floorPlans.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{floorPlans.length} Floor Plan Available</span>
            </div>
          )}
          {videos.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">
              <Play className="w-4 h-4 text-purple-600" />
              <span>Property Video Tour</span>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() =>
              setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
            }
            className="absolute left-4 text-white hover:text-gray-300 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white/80 text-xs font-semibold mt-3">
              Photo {lightboxIndex + 1} of {images.length} {images[lightboxIndex].caption ? `— ${images[lightboxIndex].caption}` : ''}
            </p>
          </div>

          <button
            onClick={() =>
              setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
            }
            className="absolute right-4 text-white hover:text-gray-300 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
