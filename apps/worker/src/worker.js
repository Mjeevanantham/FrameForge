import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJob, JOB_STATUSES, RENDER_PRESETS } from '../../../packages/shared/src/index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const outputRoot = process.env.FRAMEFORGE_OUTPUT_ROOT
  ? resolve(process.env.FRAMEFORGE_OUTPUT_ROOT)
  : resolve(repoRoot, 'storage/outputs');

function svgFrame({ frame, totalFrames, width, height }) {
  const progress = frame / Math.max(totalFrames - 1, 1);
  const x = Math.round(120 + progress * (width - 300));
  const hue = Math.round(280 - progress * 90);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#03050b"/>
  <circle cx="${x}" cy="${Math.round(height / 2)}" r="110" fill="hsl(${hue} 95% 58%)" opacity="0.9"/>
  <text x="${Math.round(width / 2)}" y="${Math.round(height / 2)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">FrameForge</text>
  <text x="${Math.round(width / 2)}" y="${Math.round(height / 2 + 90)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" letter-spacing="8" fill="#cfd6ff">SAMPLE RENDER ${frame + 1}/${totalFrames}</text>
</svg>`;
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
}

export async function renderSampleJob({
  presetId = RENDER_PRESETS.PREVIEW_720P_30.id,
  id = `sample-${Date.now()}`
} = {}) {
  const job = createJob({
    id,
    sourcePath: 'samples/basic-render/index.html',
    presetId
  });
  const jobDir = join(outputRoot, job.id);
  const framesDir = join(jobDir, 'frames');
  await mkdir(framesDir, { recursive: true });

  const preset = RENDER_PRESETS.PREVIEW_720P_30.id === presetId
    ? RENDER_PRESETS.PREVIEW_720P_30
    : RENDER_PRESETS.MVP_1080P_30;
  const renderingJob = { ...job, status: JOB_STATUSES.RENDERING, updatedAt: new Date().toISOString() };
  await writeJson(join(jobDir, 'job.json'), renderingJob);

  for (let frame = 0; frame < job.progressTotal; frame += 1) {
    const frameSvg = svgFrame({ frame, totalFrames: job.progressTotal, width: preset.width, height: preset.height });
    await writeFile(join(framesDir, `frame-${String(frame).padStart(6, '0')}.svg`), frameSvg);
  }

  const completeJob = {
    ...renderingJob,
    status: JOB_STATUSES.COMPLETE,
    progressCurrent: job.progressTotal,
    outputPath: join(jobDir, 'frames'),
    note: 'MVP scaffold writes deterministic SVG frames. Browser screenshots and FFmpeg MP4 encoding are the next worker milestones.',
    updatedAt: new Date().toISOString()
  };
  await writeJson(join(jobDir, 'job.json'), completeJob);
  await writeJson(join(jobDir, 'render-summary.json'), {
    jobId: job.id,
    preset,
    framesWritten: job.progressTotal,
    frameDirectory: completeJob.outputPath
  });

  return completeJob;
}

if (process.argv.includes('--sample')) {
  renderSampleJob()
    .then((job) => {
      console.log(`Rendered sample job ${job.id}`);
      console.log(`Frames: ${job.outputPath}`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
