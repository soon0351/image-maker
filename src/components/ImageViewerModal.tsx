import React, { useState } from 'react';
import { X, Download, Copy, Check, CheckCircle2, ClipboardCopy } from 'lucide-react';
import { downloadImageFile, copyImageToClipboard } from '../utils/downloadHelper';

interface ImageViewerModalProps {
  url: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ url, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!url) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const success = await downloadImageFile(url, 'nano_banana_highres');
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsCopying(true);
      const success = await copyImageToClipboard(url);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } else {
        // Fallback to text copy
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            고해상도 원본 뷰어
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyImage}
              disabled={isCopying}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
                copySuccess
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
              title="클립보드에 이미지 복사 (Ctrl+V로 바로 붙여넣기)"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  <span>이미지 복사</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow active:scale-95 ${
                downloadSuccess
                  ? 'bg-emerald-500 text-zinc-950'
                  : isDownloading
                  ? 'bg-amber-600 text-zinc-950 cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>저장 완료!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>다운로드 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>다운로드</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2 shadow-2xl">
          <img
            src={url}
            alt="High-Res preview"
            className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
