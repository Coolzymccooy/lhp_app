import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/client';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  album: string;
  created_at: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/forms/gallery');
        setImages(data.data ?? []);
      } catch {
        console.error('Failed to load gallery');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-20">
      {/* Hero Section */}
      <div className="section-pad mb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Gallery</h1>
          <p className="text-lg text-gray-600">Moments from our church family</p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="section-pad">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Loading gallery...</div>
          </div>
        ) : images.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No photos yet. Check back soon!</p>
          </div>
        ) : (
          <div
            className="columns-2 md:columns-3 lg:columns-4 gap-4"
            style={{ columnGap: '1rem' }}
          >
            {images.map(image => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="mb-4 w-full break-inside-avoid rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <div className="relative overflow-hidden bg-gray-100 rounded-xl">
                  <img
                    src={image.url}
                    alt={image.caption || 'Gallery image'}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {image.caption && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-3">
                      <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'Gallery image'}
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
            />

            {selectedImage.caption && (
              <div className="mt-4 text-white text-center">
                <p className="text-lg font-medium">{selectedImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
