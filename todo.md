# 🚀 Project Completion TODO: InVid AI

This document outlines the complete roadmap to finalize **InVid AI**, integrating the local Python **Podcast → Shorts Processing Pipeline** (`apps/pipeline`) with the **Next.js SaaS Web Application** (`apps/socializer`).

---

## 🏗️ System Architecture Overview

```
 [Podcast File / URL]
          │
          ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 1. PROCESSING PIPELINE (apps/pipeline - Python / FFmpeg / Ollama)      │
│  - Ingest: yt-dlp / local copy                                         │
│  - Transcribe: faster-whisper (small.en, int8, VAD filter)             │
│  - Highlight Detection: Ollama (qwen2.5:3b-instruct, 150s window)       │
│  - Boundary Snapping: Sentence alignment                                │
│  - Cut & Caption: FFmpeg 9:16 center crop + burned SRT word highlight  │
│  - Metadata & Thumbnail: Ollama + Pillow text overlay                 │
│  - DB Persistence: SQLite (Episode & Clip models)                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │  FastAPI API Server (port 8000)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. SAAS PLATFORM (apps/socializer - Next.js 14 App Router)             │
│  - Video Subtitle & Shorts Generator Dashboard (/dashboard/videoCaptioning)│
│  - YouTube Metadata & AI Generator (/dashboard/get-metadata)           │
│  - AI Voice TTS Generator (/dashboard/tts)                             │
│  - YouTube Analytics & Priority Upload Queue (/dashboard/yt)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Phase 1: Python Pipeline Verification & Optimization (`apps/pipeline`)

Validate and solidify all 9 pipeline stages built under `apps/pipeline/pipeline/` as specified in `docs/main.md`.

- [ ] **1. Ingest Module (`apps/pipeline/pipeline/ingest.py`)**
  - [ ] Test local file copy (`ingest_from_local`) to `data/raw/`.
  - [ ] Test YouTube URL downloading (`ingest_from_url`) via `yt-dlp`.
  - [ ] Ensure proper directory creation and error handling for invalid URLs/paths.

- [ ] **2. Transcription Engine (`apps/pipeline/pipeline/transcribe.py`)**
  - [ ] Verify `faster-whisper` (`small.en`, `compute_type="int8"`, `device="cpu"`).
  - [ ] Ensure `vad_filter=True` is enabled to skip silence and optimize CPU usage on 2-core machines.
  - [ ] Confirm JSON transcript output includes word-level timestamps (`start`, `end`, `word`).

- [ ] **3. Highlight Scoring & Windowing (`apps/pipeline/pipeline/highlight.py`)**
  - [ ] Verify 150s sliding window with 90s stride generation.
  - [ ] Test Ollama local LLM integration (`qwen2.5:3b-instruct`).
  - [ ] Verify JSON prompt enforcement and add robust fallback handling if parsing fails (`score: 0`).
  - [ ] Confirm greedy overlap deduplication (`min_gap=60s`).

- [ ] **4. Sentence Boundary Alignment (`apps/pipeline/pipeline/boundaries.py`)**
  - [ ] Verify start/end time snapping to full sentence segment boundaries to prevent mid-word cutting.

- [ ] **5. FFmpeg Video Cut & Word Captioning (`apps/pipeline/pipeline/cut.py`)**
  - [ ] Verify SRT file generation with relative timestamps per clip.
  - [ ] Test 9:16 vertical cropping (`crop=ih*9/16:ih,scale=1080:1920`).
  - [ ] Test burned subtitle styling with `-preset fast` and `-crf 23`.
  - [ ] Validate caption sync and video playback.

- [ ] **6. Metadata Generation (`apps/pipeline/pipeline/metadata.py`)**
  - [ ] Test Ollama metadata generation (Title < 60 chars, Description, Hashtags array).

- [ ] **7. Thumbnail Extraction & Overlay (`apps/pipeline/pipeline/thumbnail.py`)**
  - [ ] Test frame extraction at 1s timestamp.
  - [ ] Test PIL text overlay drawing on bottom black translucent banner.

- [ ] **8. Database Schema & Persistence (`apps/pipeline/pipeline/db.py`)**
  - [ ] Verify SQLite database creation at `data/pipeline.db`.
  - [ ] Confirm `Episode` and `Clip` ORM models store `pending_review` initial status.

- [ ] **9. FastApi Backend Endpoints (`apps/pipeline/dashboard/main.py`)**
  - [ ] Verify REST endpoints: `GET /api/clips`, `GET /api/clips/{id}`, `POST /api/clips/{id}/approve`, `POST /api/clips/{id}/reject`.
  - [ ] Test media streaming endpoints: `GET /video/{id}` and `GET /thumbnail/{id}`.

---

## 🖥️ Phase 2: Next.js Frontend Integration (`apps/socializer`)

Replace the empty page placeholder at `apps/socializer/src/app/dashboard/videoCaptioning/page.tsx` with a full-featured Shorts Generation & Review Dashboard.

- [ ] **1. Build Video Captioning Dashboard UI (`src/app/dashboard/videoCaptioning/page.tsx`)**
  - [ ] Create header with AI badge and project submission form (Local file path / YouTube URL input).
  - [ ] Add trigger button to run the Python pipeline background process (`/api/pipeline/process`).
  - [ ] Build clip review grid displaying pending Shorts clips.
  - [ ] Embed HTML5 `<video>` preview player for processed 9:16 clips.
  - [ ] Display clip details: AI score badge, reasoning, generated title, description, and hashtags.
  - [ ] Add **Approve (✅)** and **Reject (❌)** action buttons with immediate state update.

- [ ] **2. Next.js API Bridge to FastAPI Pipeline**
  - [ ] Create API route `src/app/api/pipeline/clips/route.ts` to proxy requests to FastAPI server (`http://localhost:8000/api/clips`).
  - [ ] Create API route `src/app/api/pipeline/process/route.ts` to trigger Python pipeline `run_episode.py` via child process or API trigger.
  - [ ] Implement approval and rejection handlers communicating with `apps/pipeline`.

- [ ] **3. Usage & Plan Limit Enforcement**
  - [ ] Connect video captioning generation to `canPerformAction` and `incrementUsage` for user plans (`free`, `pro`, `enterprise`).
  - [ ] Add `LimitExceededBanner` and toast notifications when daily generation caps are hit.

---

## 📤 Phase 3: YouTube Auto-Upload & Priority Queue Bridge

Connect approved clips directly to YouTube publishing using the existing priority queue system in `apps/socializer`.

- [ ] **1. Connect Approved Clips to Priority Upload Queue**
  - [ ] When a clip is approved in `/dashboard/videoCaptioning`, trigger an automatic enqueue into `UploadJob` (`apps/socializer/src/lib/upload-queue.ts`).
  - [ ] Map user plan (`free` -> priority 1, `pro` -> priority 2, `enterprise` -> priority 3).

- [ ] **2. Queue Worker & YouTube API Upload (`apps/socializer/src/app/api/queue/process/route.ts`)**
  - [ ] Test cron / background processing for dequeuing jobs with highest priority first.
  - [ ] Upload approved clip video binary, generated title, description, and hashtags via YouTube Data API v3 (`/api/google`).
  - [ ] Update `Clip.status` in SQLite DB / MongoDB to `uploaded` upon successful completion.

---

## 🎨 Phase 4: UI/UX & Aceternity Visual Enhancements

Fulfill all pending UI design enhancements specified in `apps/socializer/TODO.md` and `apps/socializer/README.md`.

- [ ] **1. Hero Section Container Text Flip (`apps/socializer/TODO.md`)**
  - [ ] Implement/integrate `ContainerTextFlip` effect from Aceternity UI (`components/ui/container-text-flip.tsx`) into the main landing/hero section (`components/myComponents/Hero.tsx` / `Hero2.tsx`).

- [ ] **2. Container Scroll Animation (`apps/socializer/TODO.md`)**
  - [ ] Add `ContainerScroll` animation (`components/ui/container-scroll-animation.tsx`) directly below the Hero section to showcase app product mockups dynamically.

- [ ] **3. Metadata Edit Dialog Blur Unboxing Text Effect (`apps/socializer/TODO.md`)**
  - [ ] In `apps/socializer/src/app/dashboard/yt/page.tsx`, apply the Aceternity Blur Unboxing Text Effect when rendering AI-generated title/description improvement hints (`aiHints`).

- [ ] **4. Prompt Optimization (`apps/socializer/README.md`)**
  - [ ] Refine AI system prompts in `src/lib/prompts.ts` using DeepSeek / Gemini best practices for high-converting YouTube Shorts titles, viral descriptions, and trending hashtags.

---

## 🧪 Phase 5: End-to-End Testing & Verification Checklist

Complete the 9-stage validation process on a short 10-15 minute podcast episode before running long production workloads.

- [ ] **Step 1:** Ingest local video & YouTube URL.
- [ ] **Step 2:** Transcribe short clip and confirm word timestamps in JSON output.
- [ ] **Step 3:** Confirm Ollama scoring produces valid JSON without parser errors.
- [ ] **Step 4:** Spot check sentence boundary alignment on top-scored clips.
- [ ] **Step 5:** Confirm output MP4 is cropped to 9:16 with correctly styled, synchronized burned captions.
- [ ] **Step 6:** Sanity-check AI metadata quality (title length < 60 chars, hook-driven).
- [ ] **Step 7:** Verify generated thumbnail image quality and readable text overlay.
- [ ] **Step 8:** Run end-to-end episode execution script `python -m pipeline.run_episode` on short video.
- [ ] **Step 9:** Test Next.js `/dashboard/videoCaptioning` frontend: verify video playback, thumbnail preview, approval flow, and queue dispatch.

---

*Document generated based on build specification in `docs/main.md` and codebase analysis of `apps/pipeline` & `apps/socializer`.*
