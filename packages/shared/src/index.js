export const JOB_STATUSES = Object.freeze({
  QUEUED: 'queued',
  RENDERING: 'rendering',
  ENCODING: 'encoding',
  COMPLETE: 'complete',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
});

export const RENDER_PRESETS = Object.freeze({
  MVP_1080P_30: Object.freeze({
    id: 'mvp-1080p-30',
    width: 1920,
    height: 1080,
    fps: 30,
    durationSeconds: 3,
    codec: 'h264'
  }),
  PREVIEW_720P_30: Object.freeze({
    id: 'preview-720p-30',
    width: 1280,
    height: 720,
    fps: 30,
    durationSeconds: 3,
    codec: 'h264'
  })
});

export function getPreset(presetId = RENDER_PRESETS.PREVIEW_720P_30.id) {
  const preset = Object.values(RENDER_PRESETS).find((entry) => entry.id === presetId);
  if (!preset) {
    throw new Error(`Unknown render preset: ${presetId}`);
  }
  return preset;
}

export function createJob({ id, sourcePath, presetId }) {
  if (!id) {
    throw new Error('Job id is required');
  }
  if (!sourcePath) {
    throw new Error('Job sourcePath is required');
  }

  const preset = getPreset(presetId);
  return {
    id,
    sourcePath,
    presetId: preset.id,
    status: JOB_STATUSES.QUEUED,
    progressCurrent: 0,
    progressTotal: preset.fps * preset.durationSeconds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
