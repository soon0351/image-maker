import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support high payload size for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize GoogleGenAI with telemetry User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check API key
function verifyApiKey(res: express.Response): boolean {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY가 서버 환경 변수에 설정되어 있지 않습니다. 설정 > 비밀키(Secrets)를 확인해주세요.',
    });
    return false;
  }
  return true;
}

// Fallback prompt builder when API is under temporary high demand
function generateRuleBasedPrompt(idea: string, mode: string, options: any = {}): string {
  const modeKey = mode || '일반 생성';
  let detailDesc = '';

  switch (modeKey) {
    case '이미지생성 / 합성':
      detailDesc = `Seamless photographic composition maintaining strict subject consistency. Seamlessly blend elements with matching natural lighting, soft directional shadows, atmospheric perspective, and true-to-life surface textures. Shot on 85mm f/1.4 lens, 8k resolution, immaculate color grading.`;
      break;
    case '사진복원 / 업스케일':
      detailDesc = `Comprehensive vintage photograph restoration and super-resolution upscaling. Repair scratches, paper tears, and grain while preserving original facial identity. ${options?.colorize ? 'Vivid authentic colorization with natural lifelike skin tones and accurate period colors.' : 'Crisp monochrome high dynamic range.'}`;
      break;
    case '여권사진 제작':
      detailDesc = `Official biometric passport photo standard: pure clean white background, perfectly centered frontal eye-level portrait, formal suit and attire, soft balanced studio illumination, perfectly preserving facial identity and natural expression.`;
      break;
    case '스튜디오사진 제작':
      detailDesc = `High-end luxury studio portrait with professional 3-point Rembrandt lighting, soft specular catchlights in the eyes, subtle creamy studio backdrop with gentle depth of field bokeh, photorealistic magazine cover aesthetics.`;
      break;
    case '피부보정 (정밀수정)':
      detailDesc = `Professional frequency-separation beauty retouching. Gently remove acne, redness, and blemishes while preserving genuine micro-pores, natural skin texture, and sharp facial features.`;
      break;
    case '텍스트 렌더링 포스터':
      detailDesc = `Modern graphic design typography poster. Prominently integrating stylish rendered title "${options?.posterText || 'NANO BANANA'}" with clean editorial layout, balanced negative space, and contemporary aesthetics.`;
      break;
    case '인생앨범 제작 (나이변환)':
      detailDesc = `Realistic age progression/regression to ${options?.targetAge || 25} years old. Strictly preserve bone structure, eye shape, and personal facial traits while realistically updating skin elasticity and age-appropriate features.`;
      break;
    default:
      detailDesc = `High-fidelity photorealistic rendering with sharp details, authentic textures, natural lighting, and cinematic composition.`;
      break;
  }

  return `${idea} — ${detailDesc}`;
}

// 1. AI Prompt Auto-Expansion endpoint
app.post('/api/expand-prompt', async (req, res) => {
  try {
    const { idea, mode, options } = req.body;
    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({ error: '아이디어를 입력해주세요.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // If no API key configured, use rule-based template
      return res.json({ expandedPrompt: generateRuleBasedPrompt(idea, mode, options) });
    }

    const systemInstruction = `You are an elite Google Nano Banana prompt synthesizer.
Transform the user's idea and mode into ONE single, cohesive, ready-to-run image generation prompt paragraph.

CRITICAL INSTRUCTIONS:
- Do NOT provide conversational greetings, tips, explanations, or multiple options (NO Option 1/2/3).
- Do NOT use markdown headers, bullet points, or concluding questions.
- Output ONLY the prompt itself in a single rich descriptive paragraph combining Korean intent and rich cinematic English visual descriptors (lighting, 85mm lens, textures, subject consistency, atmosphere, ultra-high resolution).`;

    // Try primary model gemini-3.8-flash, with automatic fallback on 503/429
    let expandedPrompt = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `아이디어: "${idea}"\n작업 모드: ${mode}`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      expandedPrompt = response.text?.trim() || '';
    } catch (apiErr: any) {
      console.warn('Primary prompt model encountered temporary issue, trying fallback model...', apiErr?.message);
      try {
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `아이디어: "${idea}"\n작업 모드: ${mode}\n최고 품질 이미지 생성을 위한 고해상도 상세 묘사 프롬프트로 다듬어줘.`,
        });
        expandedPrompt = fallbackRes.text?.trim() || '';
      } catch (fallbackErr) {
        console.warn('Fallback model also busy, applying rule-based expert template');
        expandedPrompt = generateRuleBasedPrompt(idea, mode, options);
      }
    }

    if (!expandedPrompt) {
      expandedPrompt = generateRuleBasedPrompt(idea, mode, options);
    }

    // Clean up any extraneous markdown framing or quotes
    expandedPrompt = expandedPrompt
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/\n?```$/i, '')
      .replace(/^["'`]|["'`]$/g, '')
      .replace(/^(Prompt|프롬프트):\s*/i, '')
      .trim();

    res.json({ expandedPrompt });
  } catch (err: any) {
    console.error('Error expanding prompt:', err);
    // Even in error, return a rich constructed prompt so user experience is uninterrupted
    const fallback = generateRuleBasedPrompt(req.body?.idea || '', req.body?.mode || '', req.body?.options);
    res.json({ expandedPrompt: fallback });
  }
});

// 2. Image Processing & Generation endpoint
app.post('/api/process-image', async (req, res) => {
  try {
    if (!verifyApiKey(res)) return;

    const {
      mode = 'composite',
      prompt = '',
      images = [],
      options = {},
    } = req.body;

    const count = Math.min(Math.max(Number(options.count) || 1, 1), 4);
    const aspectRatio = options.aspectRatio || '1:1';
    const targetModel = options.highQuality ? 'gemini-3.1-flash-image' : 'gemini-3.1-flash-lite-image';

    // Construct mode-specific directives
    let directive = '';
    switch (mode) {
      case 'composite':
        directive = `[IMAGE COMPOSITION & SYNTHESIS WITH HIGH CONSISTENCY]
Seamlessly blend and composite the uploaded images into a single cohesive, photorealistic masterpiece.
- The primary subject from the main image must strictly maintain facial identity, physical proportions, and structure.
- Objects/elements from additional reference images must be naturally embedded with mathematically consistent lighting direction, accurate contact shadows, matching atmospheric perspective, and harmonious color temperature.
- Ensure natural depth of field and no visible cutout seams or harsh borders.`;
        break;

      case 'restore':
        directive = `[PHOTO RESTORATION & UPSCALE & COLORIZATION]
Perform comprehensive vintage photo restoration and super-resolution upscaling:
- Repair and seamlessly erase all paper scratches, cracks, fold lines, dust specks, and chemical degradation stains.
- Enhance micro-details in hair strands, facial features, clothing fabric, and background depth without introducing plastic artificiality.
${options.colorize ? '- Apply rich, historically authentic, natural colorization with lifelike human skin tones, accurate eye color, and balanced environmental hues.' : '- Maintain pristine, clean, deep monochrome contrast with enhanced dynamic range.'}
- Strictly preserve the original person's authentic facial identity, bone structure, and expression.`;
        break;

      case 'passport':
        directive = `[OFFICIAL BIOMETRIC PASSPORT PHOTO GENERATION]
Transform the portrait into an official standard biometric passport photo:
- Background: Clean, pure, uniform solid light-gray or white background with zero shadows or clutter.
- Framing: Perfectly centered frontal portrait, head and top of shoulders clearly visible, upright posture.
- Lighting: Professional soft, shadowless frontal studio illumination, evenly lighting both sides of the face.
- Attire: Neat, professional business formal attire (suit, collar shirt, or elegant blouse).
- Subject consistency: Strictly preserve the subject's exact facial facial structure, eyes, nose, mouth shape, skin tone, and authentic identity. Eyes wide open looking straight into the lens, neutral/natural friendly expression.`;
        break;

      case 'studio':
        directive = `[HIGH-END LUXURY STUDIO PORTRAIT PHOTOGRAPHY]
Re-render the photo as a magazine-grade, premium studio portrait session:
- Lighting: Professional multi-point Rembrandt / butterfly studio lighting with elegant soft catchlights in the pupils.
- Background: Tasteful, velvety textured studio backdrop with soft gradient lighting and cream-smooth bokeh depth of field.
- Skin & Details: Flawless professional magazine retouching maintaining crisp authentic pore texture, rich specular highlights on hair, sharp iris details.
- Wardrobe & Pose: Styled elegantly with poise, retaining the true identity and charm of the subject.`;
        break;

      case 'skin-retouch':
        directive = `[PROFESSIONAL BEAUTY FREQUENCY SEPARATION RETOUCHING]
Perform refined, professional cosmetic skin retouching on the portrait:
- Gently remove acne, temporary blemishes, redness, harsh uneven blotches, and dark under-eye circles.
- Smooth skin tones evenly while strictly retaining micro-skin texture, fine pores, natural freckles, and facial highlights to prevent any blurry or plastic appearance.
- Enhance eye clarity, whiten sclera subtly, and add gentle gloss to lips while keeping identity 100% genuine and unaltered.`;
        break;

      case 'poster':
        directive = `[STYLISH TYPOGRAPHY POSTER DESIGN]
Design a modern, high-impact aesthetic editorial poster using the provided image:
- Typography: Prominently feature stylish, beautifully rendered typography and graphics: "${options.posterText || 'NANO BANANA STUDIO'}".
${options.posterSubText ? `- Secondary typography: "${options.posterSubText}".` : ''}
- Layout: Balanced graphic design hierarchy inspired by contemporary Swiss typography, cinematic movie posters, or luxury art magazines.
- Graphic Elements: Clean negative space, harmonious color accents, and crisp font integration that interacts aesthetically with the subject.`;
        break;

      case 'background-remove':
        directive = `[CLEAN SUBJECT ISOLATION & BACKGROUND REFINEMENT]
Isolate the primary subject with ultra-precise alpha-matte quality edge separation:
- Accurately preserve individual flyaway hair strands, fine fabric edges, and transparent elements.
- Remove all distracting background clutter, replacing it with a minimalist, clean, studio-grade aesthetic backdrop or pure isolated presentation as requested.`;
        break;

      case 'style-transfer':
        directive = `[ARTISTIC STYLE TRANSFORMATION & SKETCH COLOR]
Transform the artwork into the specified artistic medium: ${options.style || '고급 수채화/일러스트 스타일'}:
- Re-interpret the image with expressive brushwork, authentic pigments, and texture characteristic of the style.
- Maintain the recognizable silhouette, character features, composition, and soul of the original photograph.`;
        break;

      case 'age-transform':
        directive = `[LIFE ALBUM: AGE PROGRESSION / REGRESSION]
Transform the person in the photograph to realistically appear at age ${options.age || 25} years old:
- Strict Facial Consistency: Retain identical bone structure, eye shape, nose bridge, ear anatomy, and recognizable personal traits so the person is unmistakably the exact same human being.
- Age-Specific Photorealism: Naturally modify skin elasticity, subtle facial collagen, hair density or silver highlights, laughter lines, and attire appropriate for age ${options.age || 25}.
- Ultra-high photographic realism with authentic documentary skin rendering.`;
        break;

      default:
        directive = `[HIGH-FIDELITY IMAGE GENERATION & EDITING]
Generate a stunning, crisp, photorealistic visual adhering strictly to prompt details and maintaining cohesive realism.`;
        break;
    }

    const consistencyLevel = options.consistencyLevel ?? 85;
    const consistencyNote = `Consistency Fidelity Level: ${consistencyLevel}%. Maintain strong character & object coherence from the input images.`;

    const fullPrompt = [
      directive,
      consistencyNote,
      prompt ? `User Prompt: ${prompt}` : '',
      `Aspect Ratio: ${aspectRatio}`,
    ].filter(Boolean).join('\n\n');

    // Build the parts payload
    const partsPayload: any[] = [];

    // Add uploaded images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img && img.data) {
          const rawBase64 = img.data.replace(/^data:[^;]+;base64,/, '');
          const mimeType = img.mimeType || 'image/jpeg';
          partsPayload.push({
            inlineData: {
              data: rawBase64,
              mimeType,
            },
          });
        }
      }
    }

    partsPayload.push({ text: fullPrompt });

    // Helper to generate a single image candidate
    const generateSingleImage = async (seedOffset: number) => {
      // Create seed or slight variation if multiple
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: partsPayload,
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let imageUrl: string | null = null;
      let textOutput = '';

      const candidates = response.candidates || [];
      if (candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textOutput += part.text;
          }
        }
      }

      return { imageUrl, textOutput };
    };

    // Run parallel generations if count > 1
    const tasks = Array.from({ length: count }, (_, idx) => generateSingleImage(idx));
    const results = await Promise.all(tasks);

    const generatedImages = results
      .filter((r) => r.imageUrl !== null)
      .map((r, idx) => ({
        id: `img_${Date.now()}_${idx}`,
        url: r.imageUrl as string,
        prompt: fullPrompt,
        mode,
        aspectRatio,
        createdAt: new Date().toISOString(),
        notes: r.textOutput || undefined,
      }));

    if (generatedImages.length === 0) {
      // Fallback message or check text responses
      const texts = results.map((r) => r.textOutput).filter(Boolean).join('\n');
      return res.status(500).json({
        error: texts || '이미지 생성 결과가 반환되지 않았습니다. 프롬프트나 입력 이미지를 조정한 후 다시 시도해주세요.',
      });
    }

    res.json({
      success: true,
      images: generatedImages,
      mode,
      count: generatedImages.length,
    });
  } catch (err: any) {
    console.error('Error generating image:', err);
    let errorMsg = err?.message || '이미지 처리 중 예상치 못한 오류가 발생했습니다.';

    // Parse nested GoogleGenAI error JSON if present
    if (typeof errorMsg === 'string' && errorMsg.includes('RESOURCE_EXHAUSTED')) {
      errorMsg = '나노 바나나 이미지 생성 모델(Gemini Flash Image)의 사용 한도(Quota)가 초과되었거나 유료 API 키(Paid API Key) 프로젝트 선택이 필요합니다. AI Studio 결제 계정 연결을 확인해주세요.';
    } else if (typeof errorMsg === 'string' && (errorMsg.includes('429') || errorMsg.includes('quota'))) {
      errorMsg = '현재 요청량 급증으로 일시적 지연이 발생했거나 모델 할당량이 초과되었습니다. 잠시 후 다시 시도하거나 유료 API 키를 연결해주세요.';
    } else if (typeof errorMsg === 'string' && errorMsg.includes('UNAVAILABLE')) {
      errorMsg = '구글 이미지 모델 서버가 일시적으로 높은 트래픽을 처리 중입니다. 5~10초 후 다시 실행 버튼을 눌러주세요.';
    }

    res.status(500).json({ error: errorMsg });
  }
});

// 3. Image Download Proxy endpoint (ensures seamless downloads even in sandboxed iframes)
app.post('/api/download', (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).send('No image data provided');
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).send('Invalid base64 data URL');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    const safeFilename = filename
      ? `${filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_')}_${Date.now()}.${ext}`
      : `nano_banana_${Date.now()}.${ext}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Download error:', err);
    res.status(500).send('Download error');
  }
});

// Serve frontend in production or Vite middleware in dev
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
