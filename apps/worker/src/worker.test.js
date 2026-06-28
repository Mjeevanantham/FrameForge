import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const originalOutputRoot = process.env.FRAMEFORGE_OUTPUT_ROOT;

test('renderSampleJob writes deterministic frames and metadata', async () => {
  const outputRoot = await mkdtemp(join(tmpdir(), 'frameforge-worker-'));
  process.env.FRAMEFORGE_OUTPUT_ROOT = outputRoot;

  const { renderSampleJob } = await import(`./worker.js?test=${Date.now()}`);
  const job = await renderSampleJob({ id: 'test-job' });

  assert.equal(job.id, 'test-job');
  assert.equal(job.status, 'complete');
  assert.equal(job.progressCurrent, job.progressTotal);

  const jobDir = join(outputRoot, 'test-job');
  const metadata = JSON.parse(await readFile(join(jobDir, 'job.json'), 'utf8'));
  const summary = JSON.parse(await readFile(join(jobDir, 'render-summary.json'), 'utf8'));
  const frames = await readdir(join(jobDir, 'frames'));
  const firstFrame = await readFile(join(jobDir, 'frames', 'frame-000000.svg'), 'utf8');

  assert.equal(metadata.status, 'complete');
  assert.equal(summary.framesWritten, 90);
  assert.equal(frames.length, 90);
  assert.match(firstFrame, /FrameForge/);
  assert.match(firstFrame, /SAMPLE RENDER 1\/90/);

  await rm(outputRoot, { recursive: true, force: true });
  if (originalOutputRoot === undefined) {
    delete process.env.FRAMEFORGE_OUTPUT_ROOT;
  } else {
    process.env.FRAMEFORGE_OUTPUT_ROOT = originalOutputRoot;
  }
});
