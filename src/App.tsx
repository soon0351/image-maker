import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  StudioMode,
  GenerationOptions,
  UploadedImage,
  GeneratedResult,
} from './types';
import { DEFAULT_OPTIONS, MODE_CONFIG } from './constants/presets';
import { InputPanel } from './components/InputPanel';
import { ControlPanel } from './components/ControlPanel';
import { ResultPanel } from './components/ResultPanel';
import { ImageViewerModal } from './components/ImageViewerModal';

export default function App() {
  // 1. Studio state
  const [activeMode, setActiveMode] = useState<StudioMode>('composite');
  const [idea, setIdea] = useState<string>(
    '푸른 초원 배경에 따뜻한 자연광을 받는 골든 리트리버를 조명과 그림자 각도를 맞춰 자연스럽게 합성해줘'
  );
  const [refinedPrompt, setRefinedPrompt] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [options, setOptions] = useState<GenerationOptions>(DEFAULT_OPTIONS);

  // 2. Output and History state
  const [currentResult, setCurrentResult] = useState<GeneratedResult | null>(null);
  const [history, setHistory] = useState<GeneratedResult[]>([]);

  // 3. Status state
  const [isExpandingPrompt, setIsExpandingPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Action: Auto Expand Prompt with AI (Gemini 3.8 Flash)
  const handleAutoExpandPrompt = async () => {
    if (!idea.trim()) {
      showNotification('먼저 아이디어를 입력해주세요.', 'error');
      return;
    }

    try {
      setIsExpandingPrompt(true);
      const res = await fetch('/api/expand-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          mode: MODE_CONFIG[activeMode].title,
          options,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || '프롬프트 최적화에 실패했습니다.');
      }

      setRefinedPrompt(data.expandedPrompt);
      showNotification('AI 나노 바나나 프롬프트가 정밀하게 완성되었습니다!', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || '프롬프트 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsExpandingPrompt(false);
    }
  };

  // Action: Main Generation and Transformation (Nano Banana / Gemini Image)
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // Prepare payload
      const imagePayload = uploadedImages.map((img) => ({
        data: img.data,
        mimeType: img.mimeType,
        label: img.role,
      }));

      const finalPrompt = refinedPrompt.trim() || idea.trim();

      const res = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          prompt: finalPrompt,
          images: imagePayload,
          options,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || '이미지 처리에 실패했습니다.');
      }

      if (data.images && data.images.length > 0) {
        // Base image for before-after comparison
        const mainImg = uploadedImages.find((img) => img.role === 'main') || uploadedImages[0];
        const newResults: GeneratedResult[] = data.images.map((img: any) => ({
          ...img,
          sourceImagePreview: mainImg?.previewUrl,
        }));

        setCurrentResult(newResults[0]);
        setHistory((prev) => [...newResults, ...prev]);
        showNotification(
          `${MODE_CONFIG[activeMode].title} 작성이 성공적으로 완료되었습니다!`,
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      showNotification(
        err?.message || '이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Action: Reset options & inputs
  const handleReset = () => {
    setIdea(MODE_CONFIG[activeMode].defaultIdea);
    setRefinedPrompt('');
    setOptions(DEFAULT_OPTIONS);
    showNotification('설정과 아이디어가 초기화되었습니다.', 'info');
  };

  // Action: Refresh output screen (맨 우측 상단 새로고침 버튼)
  const handleClearResults = () => {
    setCurrentResult(null);
    showNotification('결과 미리보기 화면이 새로고침 되었습니다.', 'info');
  };

  // Action: Send generated result to input as base image
  const handleSendToInput = (imageUrl: string) => {
    const newImage: UploadedImage = {
      id: `derived_${Date.now()}`,
      name: `결과물_기반_${MODE_CONFIG[activeMode].title}.png`,
      data: imageUrl,
      mimeType: 'image/png',
      role: 'main',
      previewUrl: imageUrl,
      sizeKb: 250,
    };
    setUploadedImages([newImage]);
    setIdea(`앞서 생성한 이미지에 추가로 수정 및 보정 진행`);
    setRefinedPrompt('');
    showNotification('생성물이 원본 사진으로 설정되었습니다! 연속 편집이 가능합니다.', 'success');
  };

  // When user switches modes, update the default idea if current idea was just a default
  const handleModeChange = (newMode: StudioMode) => {
    setActiveMode(newMode);
    if (!idea.trim() || Object.values(MODE_CONFIG).some((m) => m.defaultIdea === idea)) {
      setIdea(MODE_CONFIG[newMode].defaultIdea);
      setRefinedPrompt('');
    }
    // Set official 3:4 portrait ratio for passport photo
    if (newMode === 'passport') {
      setOptions((prev) => ({ ...prev, aspectRatio: '3:4' }));
    }
  };

  const mainSourceImage =
    uploadedImages.find((img) => img.role === 'main')?.previewUrl ||
    uploadedImages[0]?.previewUrl;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-zinc-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/25">
              <span className="text-xl">🍌</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base lg:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>나노 바나나</span>
                  <span className="text-amber-400">AI 이미지 스튜디오</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Gemini Nano Banana
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                일관성 유지 합성 • 초해상도 복원 & 컬러화 • 여권 및 스튜디오 사진 • 정밀 피부보정 • 인생앨범
              </p>
            </div>
          </div>

          {/* Quick Status Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3파트 워크플로우 활성화</span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed top-18 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold backdrop-blur-xl border transition-all animate-bounce duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main 3-Part Layout Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* 파트 1: 입력 파트 (Left: 3.5 cols on desktop) */}
        <section className="lg:col-span-4 flex flex-col h-[calc(100vh-100px)] min-h-[640px]">
          <InputPanel
            idea={idea}
            setIdea={setIdea}
            refinedPrompt={refinedPrompt}
            setRefinedPrompt={setRefinedPrompt}
            onAutoExpandPrompt={handleAutoExpandPrompt}
            isExpandingPrompt={isExpandingPrompt}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            activeMode={activeMode}
          />
        </section>

        {/* 파트 2: 제어 파트 (Middle: 3.8 cols on desktop) */}
        <section className="lg:col-span-4 flex flex-col h-[calc(100vh-100px)] min-h-[640px]">
          <ControlPanel
            activeMode={activeMode}
            setActiveMode={handleModeChange}
            options={options}
            setOptions={setOptions}
            onReset={handleReset}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </section>

        {/* 파트 3: 생성물 결과 파트 (Right: 4.2 cols on desktop) */}
        <section className="lg:col-span-4 flex flex-col h-[calc(100vh-100px)] min-h-[640px]">
          <ResultPanel
            currentResult={currentResult}
            history={history}
            onSelectResult={(item) => setCurrentResult(item)}
            onClearResults={handleClearResults}
            onOpenZoom={(url) => setZoomUrl(url)}
            onSendToInput={handleSendToInput}
            isGenerating={isGenerating}
            baseImagePreview={mainSourceImage}
            activeMode={activeMode}
          />
        </section>
      </main>

      {/* High-Resolution Zoom Modal */}
      <ImageViewerModal url={zoomUrl} onClose={() => setZoomUrl(null)} />
    </div>
  );
}
