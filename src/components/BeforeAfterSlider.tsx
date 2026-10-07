import React, { useState, useRef, useCallback } from 'react';
import { SplitSquareHorizontal, Columns, ZoomIn } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl?: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  onOpenZoom?: (url: string) => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = '변경 전 (Original)',
  afterLabel = '변경 후 (Nano Banana)',
  onOpenZoom,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  // If there is no before image, just render the after image cleanly
  if (!beforeUrl) {
    return (
      <div className="relative group w-full h-full flex items-center justify-center bg-zinc-950/60 rounded-xl overflow-hidden border border-zinc-800/80">
        <img
          src={afterUrl}
          alt={afterLabel}
          className="max-h-[540px] w-auto max-w-full object-contain mx-auto rounded-lg shadow-2xl transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        {onOpenZoom && (
          <button
            onClick={() => onOpenZoom(afterUrl)}
            className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 p-2 rounded-lg backdrop-blur-md border border-zinc-700/60 shadow-lg transition opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs"
            title="고해상도 확대"
          >
            <ZoomIn className="w-4 h-4 text-amber-400" />
            <span>확대보기</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* View mode toggle controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-zinc-400 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          변경 전 / 후 일관성 비교
        </span>
        <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition ${
              viewMode === 'slider'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
            <span>슬라이더</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition ${
              viewMode === 'side-by-side'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>좌우 나란히</span>
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[480px] bg-zinc-950 rounded-xl overflow-hidden select-none cursor-ew-resize border border-zinc-800 shadow-2xl group"
        >
          {/* After image (Base background) */}
          <img
            src={afterUrl}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Before image (Clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeUrl}
              alt={beforeLabel}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Dividing vertical bar */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Draggable Knob */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg font-bold text-xs border-2 border-white cursor-ew-resize">
              ⇄
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-300 border border-zinc-800 shadow pointer-events-none">
            {beforeLabel}
          </div>
          <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-zinc-950 shadow pointer-events-none">
            {afterLabel}
          </div>

          {/* Quick Zoom Button */}
          {onOpenZoom && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenZoom(afterUrl);
              }}
              className="absolute bottom-3 right-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 p-2 rounded-lg backdrop-blur-md border border-zinc-700/60 shadow-lg transition opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs pointer-events-auto"
            >
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>확대</span>
            </button>
          )}
        </div>
      ) : (
        /* Side by Side layout */
        <div className="grid grid-cols-2 gap-3 h-[480px]">
          <div className="relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center p-2 group">
            <span className="absolute top-3 left-3 z-10 bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] text-zinc-300 font-semibold border border-zinc-700">
              {beforeLabel}
            </span>
            <img
              src={beforeUrl}
              alt={beforeLabel}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            {onOpenZoom && (
              <button
                type="button"
                onClick={() => onOpenZoom(beforeUrl)}
                className="absolute bottom-3 right-3 bg-zinc-900/80 hover:bg-zinc-800 p-1.5 rounded text-zinc-300 opacity-0 group-hover:opacity-100 transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative bg-zinc-950 rounded-xl overflow-hidden border border-amber-500/40 flex items-center justify-center p-2 group">
            <span className="absolute top-3 right-3 z-10 bg-amber-500/90 text-zinc-950 font-bold px-2 py-0.5 rounded text-[11px]">
              {afterLabel}
            </span>
            <img
              src={afterUrl}
              alt={afterLabel}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            {onOpenZoom && (
              <button
                type="button"
                onClick={() => onOpenZoom(afterUrl)}
                className="absolute bottom-3 right-3 bg-zinc-900/80 hover:bg-zinc-800 p-1.5 rounded text-amber-400 opacity-0 group-hover:opacity-100 transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
