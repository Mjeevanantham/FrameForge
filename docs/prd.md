# FrameForge Product Requirements Document

## Executive Summary

FrameForge will provide a reproducible HTML-to-MP4 rendering workflow for Claude, React, and plain HTML/CSS/JS animations. The product goal is to deliver high-quality video exports without per-render SaaS fees by combining a web UI, durable job queue, sandboxed headless-browser rendering, and FFmpeg encoding.

The long-term quality target is 4K at 60fps. The MVP should start with constrained presets such as 1080p at 30fps to validate correctness, security, and user workflow before scaling to heavier workloads.

## Objectives

1. Let users upload self-contained animation projects and download MP4 renders.
2. Produce deterministic frame-accurate output from seekable animations.
3. Isolate untrusted HTML/JavaScript in worker containers.
4. Keep infrastructure modular so CPU workers can later be replaced or supplemented by GPU workers.
5. Use open, reproducible building blocks: Playwright or Puppeteer, Chromium, FFmpeg, Redis-compatible queues, Postgres, and S3-compatible object storage.

## Non-Goals for MVP

- Rendering private third-party URLs or scraping external content.
- Real-time collaborative editing.
- Guaranteed 4K/60fps throughput on free-tier infrastructure.
- Full Remotion compatibility unless a project explicitly uses Remotion templates.
- Multi-tenant enterprise administration.

## Primary Users

### Animation Creator

Creators export videos from Claude artifacts, React prototypes, or hand-authored HTML animations.

### Developer / Automation User

Developers need a repeatable CLI/API workflow for generating videos from HTML templates in CI or agent workflows.

## User Stories and Acceptance Criteria

### Upload a Project

**Story:** As a user, I can upload an HTML file or zipped project.

**Acceptance Criteria:**

- The upload UI accepts `.html` and `.zip` files.
- The API stores the upload in object storage.
- A job record is created with status `queued`.
- Unsupported file types return a friendly validation error.

### Choose Render Settings

**Story:** As a user, I can choose resolution, frame rate, duration, and codec preset.

**Acceptance Criteria:**

- MVP exposes safe presets rather than arbitrary values.
- Settings are persisted with the job.
- Invalid combinations are rejected before enqueueing.

### Track Render Progress

**Story:** As a user, I can see render progress and errors.

**Acceptance Criteria:**

- The status page shows queued, rendering, encoding, complete, and failed states.
- Progress updates include current frame and total frames when available.
- Failed jobs include a user-safe error summary.

### Download MP4

**Story:** As a user, I can download the finished MP4.

**Acceptance Criteria:**

- Completed jobs expose a signed or public download URL.
- The MP4 plays in standard desktop and browser players.
- Output metadata matches selected resolution and frame rate.

### Local Developer Setup

**Story:** As a developer, I can run the app and worker locally.

**Acceptance Criteria:**

- A documented command starts the web app.
- A documented command starts the worker.
- Local Redis and storage dependencies can be run with Docker Compose.
- A sample HTML animation renders successfully in local development.

## Milestones

### 30-Day MVP

- Repository scaffolding for web app, worker, shared contracts, and Docker Compose.
- Upload API and basic status UI.
- Queue-backed worker for a fixed demo animation.
- End-to-end FFmpeg MP4 generation at 1080p/30fps.

### 60-Day v1

- User uploads for HTML and zip bundles.
- Object storage integration for uploads and outputs.
- Progress reporting and retry handling.
- 4K/60fps preset behind a guarded configuration flag.

### 90-Day v2

- Batch jobs.
- Basic auth and per-user job history.
- Worker performance profiling and optional GPU encoder support.
- Notifications for completion and failure.

### 180-Day Scale

- Horizontal worker scaling.
- Job retention policies and automated cleanup.
- Advanced security isolation for untrusted code.
- Public API or CLI.
- Paid-tier or donation-backed capacity planning.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Untrusted HTML escapes sandbox | Severe | Run workers in isolated containers, block external network by default, enforce job timeouts, and avoid privileged mounts. |
| Free-tier infrastructure is insufficient for 4K/60fps | High | Start with 1080p/30fps MVP, use queues, add GPU workers only when economically justified. |
| Non-deterministic animations produce inconsistent output | Medium | Require a seekable render contract such as `window.__FRAMEFORGE_RENDER_FRAME__(frame, timeMs)`. |
| Large frame sequences exhaust disk | High | Stream frames to FFmpeg where possible and enforce duration/resolution limits. |
| External provider limits change | Medium | Treat provider quotas as configuration assumptions and verify before launch. |

## Success Metrics

- 95% of valid sample jobs complete successfully.
- MVP sample render completes locally without manual intervention.
- Worker failures are captured with actionable logs.
- Generated MP4 metadata matches requested preset.
- No worker process persists beyond configured job timeout.
