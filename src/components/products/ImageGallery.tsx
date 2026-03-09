'use client';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const allImages = images.length > 0 ? images : [''];
  const isUrl = (s: string) => s?.startsWith('http');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current || !zoom) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="space-y-3">
      <div ref={imgRef} className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl overflow-hidden aspect-square cursor-zoom-in"
        onClick={() => setZoom(!zoom)} onMouseMove={handleMouseMove} onMouseLeave={() => setZoom(false)}>
        {isUrl(allImages[active]) ? (
          <img src={allImages[active]} alt={name}
            className={`w-full h-full object-contain transition-transform duration-300 ${zoom ? 'scale-[2.5]' : ''}`}
            style={zoom ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">{allImages[active] || '📦'}</div>
        )}
        {!zoom && <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-gray-500">
          <ZoomIn className="w-3 h-3" /> Cliquer pour zoomer
        </div>}
        {allImages.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setActive(i => (i - 1 + allImages.length) % allImages.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setActive(i => (i + 1) % allImages.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === active ? 'border-orange-500' : 'border-transparent hover:border-gray-300'}`}>
              {isUrl(img) ? <img src={img} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl flex items-center justify-center h-full">{img || '📦'}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

