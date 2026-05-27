/**
 * mark-StillWater Long-term Upgrade Agent
 * Runs for ~5 hours, checking skills and absorbing useful code
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const SKILLS_DIR = '/Users/apple/.hermes/skills/ai';
const MARK_DIR = '/Users/apple/.claude/skills/mark-StillWater';
const LOG_FILE = join(MARK_DIR, '.upgrade_log.md');
const ITERATION_FILE = join(MARK_DIR, '.upgrade_state.json');

// 安全修复：静态导入替代动态require
import(join(MARK_DIR, 'src/core/heartflow.js'))
  .then(module => {
    const hf = module.createHeartFlow ? module : { createHeartFlow: module.default?.createHeartFlow };
    console.log('[Upgrade Agent] HeartFlow loaded');
  })
  .catch(err => {
    console.error('[Upgrade Agent] Failed to load HeartFlow:', err.message);
  });

let state = {
  iteration: 0,
  processedSkills: [],
  lastSkill: null,
  startTime: Date.now(),
  duration: 5 * 60 * 60 * 1000, // 5 hours
  maxIterations: 180, // ~10 min per iteration over 30 hours, but we'll cap at 5 hours
};

async function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  await appendFile(LOG_FILE, line);
  console.log(line.trim());
}

async function appendFile(path, content) {
  const { writeFileSync } = await import('fs');
  writeFileSync(path, content, { flag: 'a' });
}

async function listSkills(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .filter(n => !n.startsWith('.') && !n.startsWith('mark-StillWater'));
  } catch {
    return [];
  }
}

async function readSkillFiles(skillPath) {
  const results = [];

  async function walk(dir) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries.slice(0, 20)) { // limit depth
        const full = join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          await walk(full);
        } else if (entry.name.endsWith('.js') || entry.name === 'SKILL.md') {
          try {
            const content = await readFile(full, 'utf8');
            const size = (await stat(full)).size;
            if (size < 50000) { // skip files > 50KB
              results.push({ path: full, content: content.slice(0, 2000), size });
            }
          } catch {}
        }
      }
    } catch {}
  }

  await walk(skillPath);
  return results;
}

function findUsefulPatterns(files) {
  const useful = [];

  for (const file of files) {
    const content = file.content;

    // Pattern: emotion/psychology
    if (/\b(emotion|psychology|feel|mood|affect)\b/i.test(content) && content.length > 200) {
      useful.push({ type: 'emotion', file: file.path, snippet: content.slice(0, 500) });
    }

    // Pattern: memory/learning
    if (/\b(memory|remember|learn|consolidat|episodic)\b/i.test(content) && content.length > 200) {
      useful.push({ type: 'memory', file: file.path, snippet: content.slice(0, 500) });
    }

    // Pattern: identity/self
    if (/\b(identity|self|consciousness|aware|exist)\b/i.test(content) && content.length > 200) {
      useful.push({ type: 'identity', file: file.path, snippet: content.slice(0, 500) });
    }

    // Pattern: reasoning/logic
    if (/\b(reason|logic|infer|analyze|evaluate)\b/i.test(content) && content.length > 200) {
      useful.push({ type: 'reasoning', file: file.path, snippet: content.slice(0, 500) });
    }
  }

  return useful;
}

async function main() {
  await log('========================================');
  await log('mark-StillWater Upgrade Agent Started');
  await log(`Duration: ${state.duration / 1000 / 60} minutes`);
  await log('========================================');

  hf.create?.() || hf.start?.();

  const skills = await listSkills(SKILLS_DIR);
  await log(`Found ${skills.length} skills to process`);

  const endTime = state.startTime + state.duration;

  for (const skill of skills) {
    if (Date.now() >= endTime) {
      await log('Time limit reached. Stopping.');
      break;
    }

    if (state.processedSkills.includes(skill)) continue;

    state.iteration++;
    state.processedSkills.push(skill);
    state.lastSkill = skill;

    await log(`[${state.iteration}] Processing: ${skill}`);

    const skillPath = join(SKILLS_DIR, skill);
    const files = await readSkillFiles(skillPath);
    await log(`  Found ${files.length} files`);

    const useful = findUsefulPatterns(files);
    if (useful.length > 0) {
      await log(`  Found ${useful.length} useful patterns:`);
      for (const u of useful.slice(0, 5)) {
        await log(`    - [${u.type}] ${u.file}`);
      }
    }

    // Small delay
    await new Promise(r => setTimeout(r, 1000));
  }

  await log('========================================');
  await log('Upgrade agent completed');
  await log(`Total iterations: ${state.iteration}`);
  await log(`Skills processed: ${state.processedSkills.length}`);
  await log('========================================');

  hf.stop?.();
}

main().catch(console.error);
