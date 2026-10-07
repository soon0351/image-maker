import React, { useRef, useState } from 'react';
import {
  Wand2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Layers,
  FileQuestion,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { UploadedImage, StudioMode } from '../types';
import { MODE_CONFIG, createSampleImage } from '../constants/presets';

interface InputPanelProps {
  idea: string;
  setIdea: (val: string) => void;
  refinedPrompt: string;
  setRefinedPrompt: (val: string) => void;
  onAutoExpandPrompt: () => void;
  isExpandingPrompt: boolean;
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  activeMode: StudioMode;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  idea,
  setIdea,
  refinedPrompt,
  setRefinedPrompt,
  onAutoExpandPrompt,
  isExpandingPrompt,
  uploadedImages,
  setUploadedImages,
  activeMode,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - uploadedImages.length;
    if (remainingSlots <= 0) {
      alert('이미지는 최대 3장까지 업로드할 수 있습니다. 기존 이미지를 삭제 후 추가해주세요.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일(JPG, PNG, WEBP 등)만 업로드할 수 있습니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newImg: UploadedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          data: dataUrl,
          mimeType: file.type,
          role: uploadedImages.length === 0 ? 'main' : 'composite',
          previewUrl: dataUrl,
          sizeKb: Math.round(file.size / 1024),
        };
        setUploadedImages((prev) => [...prev, newImg].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateRole = (id: string, role: UploadedImage['role']) => {
    setUploadedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, role } : img))
    );
  };

  // Quick preset loader helper
  const loadPreset = (type: 'vintage' | 'portrait' | 'composite') => {
    if (type === 'composite') {
      const bg = createSampleImage('landscape');
      const obj = createSampleImage('object');
      const img1: UploadedImage = {
        id: `preset_bg_${Date.now()}`,
        name: bg.name,
        data: bg.data,
        mimeType: bg.mimeType,
        role: 'main',
        previewUrl: bg.data,
        sizeKb: 24,
      };
      const img2: UploadedImage = {
        id: `preset_obj_${Date.now()}`,
        name: obj.name,
        data: obj.data,
        mimeType: obj.mimeType,
        role: 'composite',
        previewUrl: obj.data,
        sizeKb: 18,
      };
      setUploadedImages([img1, img2]);
      setIdea('초원 배경에 귀여운 피사체를 자연스러운 햇살과 그림자를 맞춰 합성해줘');
    } else if (type === 'vintage') {
      const sample = createSampleImage('vintage');
      const img: UploadedImage = {
        id: `preset_vintage_${Date.now()}`,
        name: sample.name,
        data: sample.data,
        mimeType: sample.mimeType,
        role: 'main',
        previewUrl: sample.data,
        sizeKb: 32,
      };
      setUploadedImages([img]);
      setIdea('1950년대 오래된 흑백 사진의 스크래치와 구김을 지우고, 화사한 실사 색감으로 컬러화 및 초해상도 업스케일');
    } else {
      const sample = createSampleImage('portrait');
      const img: UploadedImage = {
        id: `preset_portrait_${Date.now()}`,
        name: sample.name,
        data: sample.data,
        mimeType: sample.mimeType,
        role: 'main',
        previewUrl: sample.data,
        sizeKb: 28,
      };
      setUploadedImages([img]);
      setIdea('인물 사진을 바탕으로 단정하고 신뢰감 있는 스튜디오 및 여권사진 스타일로 변환');
    }
  };

  const modeInfo = MODE_CONFIG[activeMode];

  return (
    <div className="flex flex-col h-full bg-zinc-900/70 rounded-2xl border border-zinc-800/80 p-4 lg:p-5 backdrop-blur-xl shadow-xl space-y-5 overflow-y-auto custom-scrollbar">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20 text-sm">
            1
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span>입력 파트</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700">
                Input & Prompt
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">아이디어 기획 및 이미지 소스 업로드</p>
          </div>
        </div>
      </div>

      {/* Mode Guidance Tip */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <span>현재 모드: {modeInfo.title}</span>
            <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.2 rounded text-amber-300">
              {modeInfo.badge}
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            권장 소스: <strong className="text-amber-200">{modeInfo.recommendedImages}</strong>
          </p>
        </div>
      </div>

      {/* Idea Input Box & Auto AI Expander */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <span>아이디어 입력</span>
            <span className="text-[10px] text-zinc-500 font-normal">(자유로운 한국어 생각)</span>
          </label>
          <button
            type="button"
            onClick={() => setIdea(modeInfo.defaultIdea)}
            className="text-[11px] text-amber-400 hover:text-amber-300 transition underline underline-offset-2 flex items-center gap-1"
          >
            추천 아이디어 채우기
          </button>
        </div>

        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="예: 푸른 하늘과 눈 덮인 산을 배경으로, 부드러운 햇살을 받으며 환하게 웃는 인물 사진으로 만들어줘..."
            rows={3}
            className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-none leading-relaxed shadow-inner"
          />
        </div>

        {/* AI Prompt Auto-Expansion Action Button */}
        <button
          type="button"
          onClick={onAutoExpandPrompt}
          disabled={isExpandingPrompt || !idea.trim()}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
            isExpandingPrompt || !idea.trim()
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-950 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.99] shadow-amber-500/20'
          }`}
        >
          {isExpandingPrompt ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>AI가 나노 바나나 프롬프트 최적화 중...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-zinc-950" />
              <span>AI 프롬프트 자동 생성 (최적화)</span>
            </>
          )}
        </button>
      </div>

      {/* Refined Prompt Box (Result of AI or custom tuning) */}
      {refinedPrompt && (
        <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 animate-fade-in">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              생성 모델 최적화 프롬프트
            </span>
            <span className="text-zinc-500 text-[10px]">수정 가능</span>
          </div>
          <textarea
            value={refinedPrompt}
            onChange={(e) => setRefinedPrompt(e.target.value)}
            rows={3}
            className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none resize-none leading-relaxed border-0 p-0"
          />
        </div>
      )}

      {/* Image Upload Area (Max 3 Images) */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>이미지 업로드 (선택, 최대 3장)</span>
          </label>
          <span className="text-[11px] font-medium text-zinc-400">
            {uploadedImages.length} / 3장
          </span>
        </div>

        {/* Drag and Drop Zone */}
        {uploadedImages.length < 3 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
                : 'border-zinc-700/80 hover:border-amber-500/60 bg-zinc-950/40 hover:bg-zinc-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-amber-400 shadow">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">
                파일 선택 또는 드래그 앤 드롭
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                PNG, JPG, WEBP 지원 (최대 3장까지 조합 가능)
              </p>
            </div>
          </div>
        )}

        {/* Uploaded Image Cards List */}
        {uploadedImages.length > 0 && (
          <div className="space-y-2 pt-1">
            {uploadedImages.map((img, index) => (
              <div
                key={img.id}
                className="flex items-center gap-3 p-2 bg-zinc-950/90 rounded-xl border border-zinc-800 group hover:border-zinc-700 transition"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900">
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-0.5 left-0.5 bg-zinc-900/90 text-amber-400 text-[9px] font-bold px-1 rounded">
                    #{index + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">{img.name}</p>
                  <p className="text-[10px] text-zinc-500">{img.sizeKb} KB</p>

                  {/* Role Selector */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-zinc-500">역할:</span>
                    <select
                      value={img.role}
                      onChange={(e) => updateRole(img.id, e.target.value as any)}
                      className="bg-zinc-800 text-[10px] text-amber-300 font-medium rounded px-1.5 py-0.5 border border-zinc-700 focus:outline-none"
                    >
                      <option value="main">원본 / 베이스 사진</option>
                      <option value="composite">합성 대상 피사체</option>
                      <option value="reference">참조 스타일 / 배경</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 1-Click Test Sample Presets */}
        <div className="pt-2">
          <p className="text-[10px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>원클릭 테스트 샘플 이미지 불러오기</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => loadPreset('vintage')}
              className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-amber-300 transition text-center truncate"
            >
              오래된 흑백사진
            </button>
            <button
              type="button"
              onClick={() => loadPreset('portrait')}
              className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-amber-300 transition text-center truncate"
            >
              인물 프로필
            </button>
            <button
              type="button"
              onClick={() => loadPreset('composite')}
              className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-amber-300 transition text-center truncate"
            >
              배경+합성객체 2장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
