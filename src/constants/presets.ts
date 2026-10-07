import { StudioMode, AspectRatio, GenerationOptions } from '../types';

export const MODE_CONFIG: Record<
  StudioMode,
  {
    title: string;
    englishTitle: string;
    description: string;
    icon: string;
    badge: string;
    defaultIdea: string;
    recommendedImages: string;
  }
> = {
  composite: {
    title: '이미지생성 / 합성',
    englishTitle: 'Composite & Synthesis',
    description: '원본 사진에 합성할 개체를 조명, 그림자, 원근감까지 자연스럽게 일치시켜 일관성 있게 합성',
    icon: 'Layers',
    badge: '정밀 합성',
    defaultIdea: '푸른 잔디밭 들판 배경에 따뜻한 햇살을 받으며 앉아있는 골든 리트리버를 자연스럽게 합성해줘',
    recommendedImages: '원본 배경 1장 + 합성할 객체 사진 1장',
  },
  restore: {
    title: '사진복원 / 업스케일',
    englishTitle: 'Restore & Upscale & Color',
    description: '오래되고 훼손된 흑백/빛바랜 사진의 스크래치, 노이즈를 복구하고 초해상도 업스케일 및 자연스러운 컬러화',
    icon: 'Sparkles',
    badge: '컬러화 지원',
    defaultIdea: '빛바랜 흑백 옛날 가족사진의 구김과 흠집을 깨끗하게 복구하고 생생한 피부톤과 옷감 색상으로 컬러화해줘',
    recommendedImages: '복원할 옛날 사진 1장',
  },
  'background-remove': {
    title: '배경제거 / 부분삭제',
    englishTitle: 'Cutout & Object Removal',
    description: '인물 또는 특정 사물의 정밀 누끼 추출 및 불필요한 배경/방해 요소 자연스럽게 제거',
    icon: 'Scissors',
    badge: '정밀 누끼',
    defaultIdea: '인물의 흩날리는 머리카락 한 올까지 섬세하게 살려 배경을 깔끔하게 제거해줘',
    recommendedImages: '배경제거 대상 사진 1장',
  },
  poster: {
    title: '텍스트 렌더링 포스터',
    englishTitle: 'Typographic Poster',
    description: '세련된 타이포그래피, 타이틀, 로고 그래픽을 구도에 맞게 렌더링하여 잡지/영화 포스터 제작',
    icon: 'Type',
    badge: '타이포 디자인',
    defaultIdea: '시네마틱한 분위기의 영문 타이틀과 감각적인 서브카피가 조화된 현대적 패션 매거진 표지 포스터',
    recommendedImages: '포스터 배경으로 사용할 사진 1장',
  },
  passport: {
    title: '여권사진 제작',
    englishTitle: 'Passport Photo Maker',
    description: '업로드한 일상 사진을 국제 표준 규격(흰색 무배경, 정면 주시, 단정한 정장/셔츠)의 여권사진으로 변환',
    icon: 'UserCheck',
    badge: '규격 준수',
    defaultIdea: '어두운 조명의 셀카 사진을 단정한 네이비 정장을 입고 정면을 응시하는 공식 규격 흰색 배경 여권사진으로 만들어줘',
    recommendedImages: '얼굴이 잘 나온 정면 셀카 1장',
  },
  studio: {
    title: '스튜디오사진 제작',
    englishTitle: 'Studio Portrait Shot',
    description: '전문 스튜디오의 3점 소프트박스 조명, 매력적인 캐치라이트, 부드러운 아웃포커싱 배경의 프로필 제작',
    icon: 'Camera',
    badge: '고급 조명',
    defaultIdea: '자연스러운 포즈의 인물 사진을 고급 가죽 의자에 앉은 듯한 렘브란트 조명의 하이엔드 스튜디오 화보로 연출해줘',
    recommendedImages: '인물 프로필 사진 1장',
  },
  'skin-retouch': {
    title: '피부보정 (정밀수정)',
    englishTitle: 'Skin Retouching',
    description: '여드름, 트러블, 잡티, 다크서클을 지우면서도 본연의 모공과 피부결 질감을 완벽 보존',
    icon: 'Sparkle',
    badge: '피부결 유지',
    defaultIdea: '얼굴의 붉은 흉터와 여드름 트러블을 도자기처럼 매끄럽게 정리하되, 인위적인 블러 없이 모공 텍스처는 살려줘',
    recommendedImages: '얼굴 클로즈업 사진 1장',
  },
  'style-transfer': {
    title: '스타일변화 / 스케치채색',
    englishTitle: 'Style Transfer & Sketch',
    description: '수채화, 유화, 3D 애니메이션 렌더, 연필 스케치 채색 등 예술적 스타일로 원본을 재탄생',
    icon: 'Palette',
    badge: '아트 렌더링',
    defaultIdea: '풍경 사진을 지브리 애니메이션 풍의 수채화 일러스트 스타일로 따뜻하고 화사하게 채색해줘',
    recommendedImages: '스타일 변환할 사진 1장 (또는 스케치 1장)',
  },
  'age-transform': {
    title: '인생앨범 제작 (나이변환)',
    englishTitle: 'Life Album (Age Travel)',
    description: '원하는 나이(유아기, 20대, 50대, 80대)를 입력하면 이목구비 일관성을 유지하며 시간 여행 변환',
    icon: 'Calendar',
    badge: '얼굴 일관성',
    defaultIdea: '현재 30대 인물 사진의 골격과 눈매를 그대로 유지하면서 75세의 온화하고 품격 있는 노년의 모습으로 변형해줘',
    recommendedImages: '인물 정면 사진 1장',
  },
};

export const DEFAULT_OPTIONS: GenerationOptions = {
  aspectRatio: '1:1',
  count: 1,
  consistencyLevel: 85,
  highQuality: false,
  colorize: true,
  upscale: true,
  targetAge: 70,
  posterText: 'NANO BANANA',
  posterSubText: 'AI CREATIVE VISION 2026',
  stylePreset: 'watercolor',
  skinFocus: 'all',
};

export const STYLE_PRESETS = [
  { id: 'watercolor', name: '맑은 수채화' },
  { id: 'anime', name: '지브리/애니메 감성' },
  { id: 'oil-painting', name: '클래식 유화' },
  { id: '3d-render', name: '시네마틱 3D 그래픽' },
  { id: 'sketch-color', name: '연필 스케치 채색' },
  { id: 'cyberpunk', name: '사이버펑크 네온' },
];

export const AGE_PRESETS = [
  { age: 5, label: '5세 (유년기)' },
  { age: 17, label: '17세 (학창시절)' },
  { age: 25, label: '25세 (빛나는 청춘)' },
  { age: 45, label: '45세 (원숙한 중년)' },
  { age: 70, label: '70세 (온화한 노년)' },
];

// Helper canvas-based generation to provide valid PNG base64 images that Gemini API supports
export function createSampleImage(type: 'vintage' | 'portrait' | 'landscape' | 'object'): { name: string; data: string; mimeType: string } {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      if (type === 'portrait' || type === 'vintage') {
        canvas.width = 600;
        canvas.height = 750;
      } else {
        canvas.width = 800;
        canvas.height = 600;
      }

      if (type === 'vintage') {
        // Vintage Sepia photo
        const grad = ctx.createLinearGradient(0, 0, 0, 750);
        grad.addColorStop(0, '#c7b299');
        grad.addColorStop(1, '#8c7355');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 750);

        // Portrait silhouette
        ctx.fillStyle = '#4a3b2c';
        ctx.beginPath();
        ctx.arc(300, 270, 110, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(300, 540, 180, 160, 0, 0, Math.PI * 2);
        ctx.fill();

        // Scratch lines
        ctx.strokeStyle = '#e8dec8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 120);
        ctx.lineTo(380, 480);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(520, 80);
        ctx.lineTo(190, 620);
        ctx.stroke();

        // Title text
        ctx.fillStyle = '#f5efe6';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        ctx.fillText('1952년 흑백 옛날 사진 (샘플)', 300, 700);

        return {
          name: '샘플_오래된흑백사진.png',
          mimeType: 'image/png',
          data: canvas.toDataURL('image/png'),
        };
      }

      if (type === 'portrait') {
        // High quality portrait sample
        const grad = ctx.createLinearGradient(0, 0, 600, 750);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 750);

        // Head and skin
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(300, 260, 120, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(300, 230, 125, Math.PI, 0);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(260, 260, 10, 0, Math.PI * 2);
        ctx.arc(340, 260, 10, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(300, 300, 30, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Business suit shoulders
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(300, 540, 210, 160, 0, 0, Math.PI * 2);
        ctx.fill();

        // White collared shirt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(270, 380);
        ctx.lineTo(330, 380);
        ctx.lineTo(300, 470);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('인물 일상 프로필 (여권/스튜디오용 샘플)', 300, 710);

        return {
          name: '샘플_인물프로필.png',
          mimeType: 'image/png',
          data: canvas.toDataURL('image/png'),
        };
      }

      if (type === 'landscape') {
        // Landscape background
        const sky = ctx.createLinearGradient(0, 0, 0, 380);
        sky.addColorStop(0, '#38bdf8');
        sky.addColorStop(1, '#fef08a');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 800, 380);

        // Sun
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(680, 100, 45, 0, Math.PI * 2);
        ctx.fill();

        // Hills
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 380, 800, 220);

        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(400, 520, 320, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('합성용 초원 배경 (샘플)', 400, 560);

        return {
          name: '샘플_원본초원배경.png',
          mimeType: 'image/png',
          data: canvas.toDataURL('image/png'),
        };
      }

      // Object
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(400, 300, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(350, 270, 25, 0, Math.PI * 2);
      ctx.arc(450, 270, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(350, 270, 12, 0, Math.PI * 2);
      ctx.arc(450, 270, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(380, 310);
      ctx.lineTo(420, 310);
      ctx.lineTo(400, 335);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('합성 대상 피사체 (샘플)', 400, 520);

      return {
        name: '샘플_합성피사체.png',
        mimeType: 'image/png',
        data: canvas.toDataURL('image/png'),
      };
    }
  }

  // Fallback 1x1 transparent png if SSR
  return {
    name: 'sample.png',
    mimeType: 'image/png',
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };
}
