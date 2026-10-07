import React, { useState } from 'react';
import {
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check,
  Maximize2,
  ArrowLeft,
  Sparkles,
  Layers,
  History,
  Trash2,
  Send,
  Eye,
  Camera,
  ClipboardCopy,
  CheckCircle2,
} from 'lucide-react';
import { GeneratedResult, UploadedImage, StudioMode } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { MODE_CONFIG } from '../constants/presets';
import { downloadImageFile, copyImageToClipboard } from '../utils/downloadHelper';

interface ResultPanelProps {
  currentResult: GeneratedResult | null;
  history: GeneratedResult[];
  onSelectResult: (item: GeneratedResult) => void;
  onClearResults: () => void;
  onOpenZoom: (url: string) => void;
  onSendToInput: (url: string) => void;
  isGenerating: boolean;
  baseImagePreview?: string;
  activeMode: StudioMode;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  currentResult,
  history,
  onSelectResult,
  onClearResults,
  onOpenZoom,
  onSendToInput,
  isGenerating,
  baseImagePreview,
  activeMode,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [imageCopySuccess, setImageCopySuccess] = useState(false);

  const handleDownload = async (url: string) => {
    try {
      setIsDownloading(true);
      const modeTitle = currentResult ? currentResult.mode : 'result';
      const success = await downloadImageFile(url, `nano_banana_${modeTitle}`);
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

  const handleCopyImage = async (url: string) => {
    try {
      setIsCopyingImage(true);
      const success = await copyImageToClipboard(url);
      if (success) {
        setImageCopySuccess(true);
        setTimeout(() => setImageCopySuccess(false), 2500);
      } else {
        alert('클립보드 복사에 실패했습니다. 다운로드 버튼을 이용해주세요.');
      }
    } catch (err) {
      console.error('Copy error:', err);
    } finally {
      setIsCopyingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/70 rounded-2xl border border-zinc-800/80 p-4 lg:p-5 backdrop-blur-xl shadow-xl space-y-4 overflow-y-auto custom-scrollbar">
      {/* Panel Header with Refresh Button AT TOP RIGHT */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20 text-sm">
            3
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span>생성물 결과 파트</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700">
                Output Studio
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">실시간 미리보기, 전후 비교 및 저장</p>
          </div>
        </div>

        {/* 새로고침화면 버튼: 맨우측 상단에 배치 */}
        <button
          type="button"
          onClick={onClearResults}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 hover:text-amber-300 bg-zinc-800/90 hover:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700 hover:border-amber-500/40 shadow transition group"
          title="생성물 결과 화면 새로고침 (초기화)"
        >
          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-amber-400" />
          <span>새로고침</span>
        </button>
      </div>

      {/* Main Preview Screen */}
      <div className="flex-1 min-h-[380px] flex flex-col justify-center">
        {isGenerating ? (
          /* Loading Animation View */
          <div className="w-full h-[460px] rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col items-center justify-center p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-pulse" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-bounce">
                <Sparkles className="w-8 h-8 text-zinc-950" />
              </div>
              <div className="absolute -inset-2 rounded-2xl border border-amber-400/30 animate-ping" />
            </div>
            <div className="space-y-1 z-10">
              <h3 className="text-base font-bold text-zinc-100">
                나노 바나나 일관성 엔진 가동 중...
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                조명 매칭, 피사체 일관성 보존, 초해상도 픽셀 정밀 수정을 수행하고 있습니다.
              </p>
            </div>
          </div>
        ) : currentResult ? (
          /* Result Loaded View */
          <div className="space-y-3">
            {/* Interactive Draggable Before / After Slider */}
            <BeforeAfterSlider
              beforeUrl={currentResult.sourceImagePreview || baseImagePreview}
              afterUrl={currentResult.url}
              beforeLabel="변경 전 (Original)"
              afterLabel={`변경 후 (${MODE_CONFIG[currentResult.mode]?.title || '결과'})`}
              onOpenZoom={onOpenZoom}
            />

            {/* Quick Action Buttons for Current Result */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {MODE_CONFIG[currentResult.mode]?.badge || '생성 완료'}
                </span>
                <span className="text-[11px] text-zinc-500">비율: {currentResult.aspectRatio}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Send back to input as base image (Iterative editing) */}
                <button
                  type="button"
                  onClick={() => onSendToInput(currentResult.url)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition border border-zinc-700"
                  title="이 생성물을 원본 사진으로 설정하여 추가 작업 진행"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>원본으로 보내기</span>
                </button>

                {/* Copy Image to Clipboard */}
                <button
                  type="button"
                  onClick={() => handleCopyImage(currentResult.url)}
                  disabled={isCopyingImage}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
                    imageCopySuccess
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  }`}
                  title="클립보드에 이미지 복사 (Ctrl+V로 카카오톡/문서 등에 바로 붙여넣기)"
                >
                  {imageCopySuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>이미지 복사</span>
                    </>
                  )}
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={() => handleDownload(currentResult.url)}
                  disabled={isDownloading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow active:scale-95 ${
                    downloadSuccess
                      ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/25'
                      : isDownloading
                      ? 'bg-amber-600 text-zinc-950 cursor-wait'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                  }`}
                  title="고해상도 이미지 파일로 PC에 다운로드 저장"
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
              </div>
            </div>
          </div>
        ) : (
          /* Empty Initial State View */
          <div className="w-full h-[460px] rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-300">생성된 결과물이 여기에 표시됩니다</h3>
              <p className="text-xs text-zinc-500 max-w-xs">
                왼쪽에서 아이디어나 이미지를 입력하고, 가운데에서 원하는 모드를 선택한 뒤 실행 버튼을 눌러주세요.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-400/80">
              <Sparkles className="w-3.5 h-3.5" />
              <span>여권사진, 스튜디오 화보, 옛날 사진 복원 즉시 지원</span>
            </div>
          </div>
        )}
      </div>

      {/* History Gallery (생성 내역 갤러리) */}
      {history.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>생성 내역 갤러리</span>
            </span>
            <span className="text-[10px] text-zinc-500">{history.length}개 보관</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
            {history.map((item) => {
              const isSelected = currentResult?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectResult(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition group ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40'
                      : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.mode}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item.url);
                        }}
                        className="p-1 rounded bg-zinc-900/90 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 transition shadow"
                        title="이 이미지 바로 다운로드"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[9px] text-amber-300 font-semibold truncate">
                      {MODE_CONFIG[item.mode]?.title || item.mode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
