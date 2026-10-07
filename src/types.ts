export type StudioMode =
  | 'composite'         // 이미지생성/합성
  | 'restore'           // 사진복원/업스케일 (with 컬러화)
  | 'background-remove' // 배경제거/부분삭제
  | 'poster'            // 텍스트 렌더링 포스터
  | 'passport'          // 여권사진 제작
  | 'studio'            // 스튜디오사진 제작
  | 'skin-retouch'      // 피부보정
  | 'style-transfer'    // 스타일변화/스케치채색
  | 'age-transform';    // 인생앨범 제작

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface UploadedImage {
  id: string;
  name: string;
  data: string; // base64 data url
  mimeType: string;
  role: 'main' | 'composite' | 'style' | 'reference';
  previewUrl: string;
  sizeKb: number;
}

export interface GenerationOptions {
  aspectRatio: AspectRatio;
  count: number;
  consistencyLevel: number; // 0 - 100%
  highQuality: boolean;
  // Mode specific options
  colorize: boolean;        // 사진복원 시 컬러화
  upscale: boolean;         // 초해상도 업스케일
  targetAge: number;        // 인생앨범 목표 나이
  posterText: string;       // 포스터 메인 텍스트
  posterSubText: string;    // 포스터 서브 텍스트
  stylePreset: string;      // 스타일 프리셋
  skinFocus: 'all' | 'acne' | 'smooth' | 'glow';
}

export interface GeneratedResult {
  id: string;
  url: string;
  mode: StudioMode;
  prompt: string;
  aspectRatio: AspectRatio;
  createdAt: string;
  sourceImagePreview?: string;
  notes?: string;
}
