import React from 'react';
import {
  Layers,
  Sparkles,
  Scissors,
  Type,
  UserCheck,
  Camera,
  Sparkle,
  Palette,
  Calendar,
  RotateCcw,
  Play,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import { StudioMode, AspectRatio, GenerationOptions } from '../types';
import { MODE_CONFIG, STYLE_PRESETS, AGE_PRESETS } from '../constants/presets';

interface ControlPanelProps {
  activeMode: StudioMode;
  setActiveMode: (mode: StudioMode) => void;
  options: GenerationOptions;
  setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
  onReset: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeMode,
  setActiveMode,
  options,
  setOptions,
  onReset,
  onGenerate,
  isGenerating,
}) => {
  const modes: { id: StudioMode; label: string; icon: any; badge?: string }[] = [
    { id: 'composite', label: '이미지생성 / 합성', icon: Layers, badge: '정밀합성' },
    { id: 'restore', label: '사진복원 / 업스케일', icon: Sparkles, badge: '컬러화' },
    { id: 'background-remove', label: '배경제거 / 부분삭제', icon: Scissors },
    { id: 'poster', label: '텍스트 렌더링 포스터', icon: Type },
    { id: 'passport', label: '여권사진 제작', icon: UserCheck, badge: '표준규격' },
    { id: 'studio', label: '스튜디오사진 제작', icon: Camera, badge: '프로조명' },
    { id: 'skin-retouch', label: '피부보정 (정밀수정)', icon: Sparkle },
    { id: 'style-transfer', label: '스타일변화 / 스케치', icon: Palette },
    { id: 'age-transform', label: '인생앨범 제작 (나이변환)', icon: Calendar, badge: '얼굴일관성' },
  ];

  const aspectRatios: { id: AspectRatio; label: string; ratioW: number; ratioH: number }[] = [
    { id: '1:1', label: '1:1 (정사각형)', ratioW: 1, ratioH: 1 },
    { id: '16:9', label: '16:9 (와이드)', ratioW: 16, ratioH: 9 },
    { id: '9:16', label: '9:16 (세로/릴스)', ratioW: 9, ratioH: 16 },
    { id: '4:3', label: '4:3 (클래식)', ratioW: 4, ratioH: 3 },
    { id: '3:4', label: '3:4 (인물/여권)', ratioW: 3, ratioH: 4 },
  ];

  const currentModeInfo = MODE_CONFIG[activeMode];

  return (
    <div className="flex flex-col h-full bg-zinc-900/70 rounded-2xl border border-zinc-800/80 p-4 lg:p-5 backdrop-blur-xl shadow-xl space-y-5 overflow-y-auto custom-scrollbar">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20 text-sm">
            2
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span>제어 파트</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700">
                Mode & Controls
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">모드 선택, 정밀 파라미터 및 변환 옵션 제어</p>
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700/80 px-2.5 py-1.5 rounded-lg border border-zinc-700 transition"
          title="모든 옵션 및 입력 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>초기화</span>
        </button>
      </div>

      {/* Feature Mode Selector Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>작업 기능 모드 선택</span>
          </label>
          <span className="text-[10px] text-amber-400/90 font-mono">9개 전문 모드</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={`relative w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-amber-500/70 text-amber-300 shadow-md shadow-amber-500/5'
                    : 'bg-zinc-950/60 hover:bg-zinc-950 border-zinc-800/80 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold block truncate">
                      {mode.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {mode.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/90 text-amber-400 border border-amber-500/20 font-medium">
                      {mode.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode-Specific Advanced Sub-Controls */}
      <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-3.5">
        <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
          <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{currentModeInfo.title} 상세 제어</span>
          </span>
          <span className="text-[10px] text-zinc-500">{currentModeInfo.englishTitle}</span>
        </div>

        {/* 1. Restore Mode: Colorize & Upscale buttons/toggles */}
        {activeMode === 'restore' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  자연스러운 컬러화 (Colorization)
                </span>
                <span className="text-[10px] text-zinc-400">
                  흑백/빛바랜 사진을 생생한 실사 색상으로 복원
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOptions((prev) => ({ ...prev, colorize: !prev.colorize }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  options.colorize
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {options.colorize ? '컬러화 활성' : '흑백 유지'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  초해상도 업스케일 (Super Resolution)
                </span>
                <span className="text-[10px] text-zinc-400">
                  노이즈 및 스크래치 제거 후 고화질 디테일 보강
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOptions((prev) => ({ ...prev, upscale: !prev.upscale }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  options.upscale
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {options.upscale ? '업스케일 On' : '기본 복원'}
              </button>
            </div>
          </div>
        )}

        {/* 2. Passport Mode: Guidance & Standard format */}
        {activeMode === 'passport' && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200 space-y-1">
              <span className="font-semibold flex items-center gap-1 text-blue-300">
                <Check className="w-3.5 h-3.5" />
                국제 여권 표준 규격 자동 적용
              </span>
              <p className="text-[11px] text-zinc-300">
                • 순백색/단색 무배경 변환
                <br />• 얼굴 및 어깨 중심 정면 응시 구도
                <br />• 단정한 정장/셔츠 스타일로 단장
                <br />• 얼굴 이목구비 100% 동일 인물 일관성 보존
              </p>
            </div>
          </div>
        )}

        {/* 3. Studio Mode: Lighting & Backdrop presets */}
        {activeMode === 'studio' && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 space-y-1">
              <span className="font-semibold text-amber-300 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                하이엔드 스튜디오 프로필 촬영 기법
              </span>
              <p className="text-[11px] text-zinc-300">
                • 렘브란트 3점 조명 & 눈동자 캐치라이트 생성
                <br />• 고급 질감의 벨벳/다크그레이 스튜디오 배경
                <br />• 얕은 심도(Bokeh)로 피사체 극대화
              </p>
            </div>
          </div>
        )}

        {/* 4. Poster Mode: Typography input */}
        {activeMode === 'poster' && (
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                메인 타이틀 텍스트 (로고/제목)
              </label>
              <input
                type="text"
                value={options.posterText}
                onChange={(e) => setOptions((prev) => ({ ...prev, posterText: e.target.value }))}
                placeholder="예: NANO BANANA, SEOUL VIBE, MOVIE TITLE"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                서브 슬로건 (카피 문구)
              </label>
              <input
                type="text"
                value={options.posterSubText}
                onChange={(e) => setOptions((prev) => ({ ...prev, posterSubText: e.target.value }))}
                placeholder="예: SPECIAL EDITION 2026, SUMMER ISSUE"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* 5. Age Transform Mode: Target Age Slider & Presets */}
        {activeMode === 'age-transform' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200">
                목표 나이 변형: <strong className="text-amber-400 font-bold text-sm">{options.targetAge}세</strong>
              </label>
              <span className="text-[10px] text-zinc-400">1 ~ 100세</span>
            </div>

            <input
              type="range"
              min={3}
              max={95}
              value={options.targetAge}
              onChange={(e) => setOptions((prev) => ({ ...prev, targetAge: Number(e.target.value) }))}
              className="w-full accent-amber-400 cursor-pointer"
            />

            {/* Quick age chips */}
            <div className="flex flex-wrap gap-1.5">
              {AGE_PRESETS.map((preset) => (
                <button
                  key={preset.age}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, targetAge: preset.age }))}
                  className={`text-[10px] px-2 py-1 rounded-md transition font-medium ${
                    options.targetAge === preset.age
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. Skin Retouch Mode: Detail Focus */}
        {activeMode === 'skin-retouch' && (
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              보정 집중 영역
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'all', label: '전체 피부결 + 잡티' },
                { id: 'acne', label: '여드름/트러블 집중' },
                { id: 'smooth', label: '도자기 피부결' },
                { id: 'glow', label: '화사한 물광 톤' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, skinFocus: item.id as any }))}
                  className={`text-[11px] py-1.5 px-2 rounded-lg font-medium transition text-center ${
                    options.skinFocus === item.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 7. Style Transfer Mode: Preset styles */}
        {activeMode === 'style-transfer' && (
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              예술 스타일 선택
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, stylePreset: preset.id }))}
                  className={`text-[11px] py-1.5 px-2 rounded-lg font-medium transition text-center ${
                    options.stylePreset === preset.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Image Generation Options */}
      <div className="space-y-3.5 pt-2 border-t border-zinc-800/80">
        {/* Aspect Ratio Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-200">생성 비율 (Aspect Ratio)</span>
            <span className="text-[11px] text-amber-400 font-mono">{options.aspectRatio}</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {aspectRatios.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOptions((prev) => ({ ...prev, aspectRatio: item.id }))}
                className={`py-2 px-1 rounded-lg text-center transition flex flex-col items-center justify-center gap-1 border ${
                  options.aspectRatio === item.id
                    ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400 shadow-md shadow-amber-400/20'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`border rounded-sm ${
                    options.aspectRatio === item.id ? 'border-zinc-950 bg-zinc-950/20' : 'border-zinc-500'
                  }`}
                  style={{
                    width: item.ratioW >= item.ratioH ? '18px' : `${Math.round(18 * (item.ratioW / item.ratioH))}px`,
                    height: item.ratioH >= item.ratioW ? '18px' : `${Math.round(18 * (item.ratioH / item.ratioW))}px`,
                  }}
                />
                <span className="text-[10px]">{item.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count Selector */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-200 block">생성할 장수</span>
            <span className="text-[10px] text-zinc-500">한 번에 생성할 이미지 변형 수</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setOptions((prev) => ({ ...prev, count: num }))}
                className={`w-7 h-7 rounded-md text-xs font-bold transition flex items-center justify-center ${
                  options.count === num
                    ? 'bg-amber-400 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Consistency Slider (Nano Banana Key Feature) */}
        <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>나노 바나나 일관성 보존도</span>
            </span>
            <span className="text-amber-400 font-bold font-mono text-xs">
              {options.consistencyLevel}%
            </span>
          </div>
          <input
            type="range"
            min={40}
            max={100}
            value={options.consistencyLevel}
            onChange={(e) => setOptions((prev) => ({ ...prev, consistencyLevel: Number(e.target.value) }))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>자유로운 창의성 (40%)</span>
            <span>최대 원본 일치 (100%)</span>
          </div>
        </div>
      </div>

      {/* Main Action Execute Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl ${
            isGenerating
              ? 'bg-zinc-800 text-zinc-400 cursor-wait border border-zinc-700'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-950 hover:brightness-110 active:scale-[0.99] shadow-amber-500/25 hover:shadow-amber-500/40'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>나노 바나나 정밀 연산 중...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-zinc-950 text-zinc-950" />
              <span>{currentModeInfo.title} 실행하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
