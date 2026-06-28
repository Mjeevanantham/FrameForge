# FrameForge Implementation Backlog

## Epic 1: Repository and Tooling

- [ ] Choose package manager and monorepo layout.
- [ ] Scaffold `apps/web`.
- [ ] Scaffold `apps/worker`.
- [ ] Add `packages/shared` for job types and render settings.
- [ ] Add linting, formatting, and TypeScript configuration.
- [ ] Add CI for type checks, linting, and tests.
- [ ] Add Docker Compose for Redis and local storage.

## Epic 2: Web Upload and Job API

- [ ] Build upload form with resolution, FPS, duration, and codec presets.
- [ ] Implement file validation for `.html` and `.zip` uploads.
- [ ] Create job records in the database.
- [ ] Store uploads in object storage.
- [ ] Enqueue jobs through BullMQ.
- [ ] Add status endpoint.
- [ ] Add job detail page with polling.

## Epic 3: Worker Rendering Pipeline

- [ ] Implement worker bootstrap and queue consumer.
- [ ] Download and unpack uploads into isolated temp directories.
- [ ] Serve project files from a local static server rooted at the job directory.
- [ ] Launch Playwright Chromium with configured viewport.
- [ ] Detect and invoke `window.__FRAMEFORGE_RENDER_FRAME__`.
- [ ] Capture PNG frames for a short sample animation.
- [ ] Add per-frame progress updates.
- [ ] Add cleanup for temp directories.

## Epic 4: Encoding Pipeline

- [ ] Add FFmpeg binary discovery or bundled static FFmpeg.
- [ ] Encode a staged PNG sequence to H.264 MP4.
- [ ] Validate output metadata with FFprobe.
- [ ] Upload output MP4 to object storage.
- [ ] Persist output location and status.
- [ ] Add configurable presets for CRF and encoder speed.
- [ ] Investigate streaming frames directly to FFmpeg to reduce disk usage.

## Epic 5: Security and Reliability

- [ ] Enforce upload size limits.
- [ ] Enforce max duration, max frames, and max resolution.
- [ ] Add worker job timeout and cancellation handling.
- [ ] Block or allowlist browser network requests.
- [ ] Add structured error codes.
- [ ] Add retry policy and dead-letter queue.
- [ ] Add object lifecycle cleanup for old uploads and outputs.
- [ ] Add minimal content security policy for web UI.

## Epic 6: Observability

- [ ] Add structured JSON logs in API and worker.
- [ ] Add Sentry or equivalent crash reporting.
- [ ] Add render duration, encode duration, and failure-rate metrics.
- [ ] Add health endpoint for API.
- [ ] Add worker heartbeat or queue-lag metric.

## Epic 7: Quality and Performance

- [ ] Build sample animations for DOM, CSS animation, Canvas, and React.
- [ ] Benchmark 1080p/30fps and 4K/60fps locally.
- [ ] Profile disk, CPU, and memory usage.
- [ ] Add frame-parallelism experiment behind a feature flag.
- [ ] Add optional GPU encoder detection.
- [ ] Document recommended instance sizes for each preset.

## First Sprint Candidate Scope

1. Scaffold web, worker, and shared package structure.
2. Add local Redis with Docker Compose.
3. Render a bundled sample HTML file to MP4 from the worker.
4. Expose a minimal API route that enqueues the sample render.
5. Add a status page that polls job state.

## Definition of Done for MVP

- A new developer can render the sample project by following README commands.
- A user can upload one valid HTML project and download a playable MP4.
- Invalid input fails safely with a clear error.
- Worker cleans up intermediate files after success or failure.
- CI runs type checks and at least one smoke test.

## Completed Foundation Work

- [x] Add repository-level README and product documentation.
- [x] Add primary SVG logo and brand guidance.
- [x] Add workspace package metadata and root scripts.
- [x] Add shared job statuses, render presets, and job creation helpers.
- [x] Add a zero-dependency web shell with a health endpoint and branded landing page.
- [x] Add a worker smoke test that writes deterministic sample frames.
- [x] Add a seekable sample HTML animation using `window.__FRAMEFORGE_RENDER_FRAME__`.
