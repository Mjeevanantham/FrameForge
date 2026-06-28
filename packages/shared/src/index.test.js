import assert from 'node:assert/strict';
import test from 'node:test';
import { createJob, getPreset, JOB_STATUSES, RENDER_PRESETS } from './index.js';

test('getPreset returns a known preset', () => {
  assert.equal(getPreset('preview-720p-30').width, 1280);
});

test('getPreset rejects unknown presets', () => {
  assert.throws(() => getPreset('missing'), /Unknown render preset/);
});

test('createJob initializes queued job progress from preset', () => {
  const job = createJob({ id: 'job-1', sourcePath: 'samples/basic-render/index.html', presetId: RENDER_PRESETS.PREVIEW_720P_30.id });
  assert.equal(job.status, JOB_STATUSES.QUEUED);
  assert.equal(job.progressTotal, 90);
});
