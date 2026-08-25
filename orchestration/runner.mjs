#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const tasksDir = path.join(root, 'tasks');
const statusFile = path.join(root, 'STATUS.md');
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run') || !process.env.CODEX_AGENT_COMMAND;
const maxParallel = Number(process.env.CODEX_MAX_PARALLEL || 2);

function scalar(value) {
  const v = value.trim();
  if (v === '[]') return [];
  if (v === 'true' || v === 'false') return v === 'true';
  if (/^\d+$/.test(v)) return Number(v);
  return v.replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const result = {};
  let listKey = null;
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;
    const list = line.match(/^\s+-\s+(.+)$/);
    if (list && listKey) {
      result[listKey].push(scalar(list[1]));
      continue;
    }
    const pair = line.match(/^([\w]+):\s*(.*)$/);
    if (!pair) continue;
    const [, key, raw] = pair;
    if (raw === '') {
      result[key] = [];
      listKey = key;
    } else if (raw.startsWith('[')) {
      result[key] = raw
        .slice(1, -1)
        .split(',')
        .map((s) => scalar(s))
        .filter(Boolean);
      listKey = null;
    } else {
      result[key] = scalar(raw);
      listKey = null;
    }
  }
  return result;
}

async function loadTasks() {
  const files = (await fs.readdir(tasksDir)).filter((f) => f.endsWith('.md') && f !== 'README.md');
  return Promise.all(
    files.map(async (file) => {
      const full = path.join(tasksDir, file);
      const text = await fs.readFile(full, 'utf8');
      const meta = parseFrontmatter(text);
      return { file, full, text, meta };
    }),
  );
}

function readyTasks(tasks) {
  const byId = new Map(tasks.map((t) => [t.meta.id, t]));
  return tasks.filter((t) => {
    if (!t.meta || t.meta.status !== 'ready' || t.meta.human_gate === true) return false;
    return (t.meta.depends_on || []).every((id) => byId.get(id)?.meta.status === 'done');
  });
}

async function updateTask(task, status) {
  const text = task.text.replace(/^(status:\s*).+$/m, `$1${status}`);
  await fs.writeFile(task.full, text);
  task.text = text;
  task.meta.status = status;
}

async function logStatus(lines) {
  const previous = await fs.readFile(statusFile, 'utf8').catch(() => '# Development status\n');
  const stamp = new Date().toISOString();
  const block = `\n- ${stamp} — ${lines.join('; ')}\n`;
  await fs.writeFile(statusFile, `${previous.trimEnd()}${block}`);
}

function run(command, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: root,
      shell: true,
      env: { ...process.env, ...env, CODEX_ORCHESTRATOR: '1' },
      stdio: 'inherit',
    });
    child.on('close', (code) => resolve(code ?? 1));
  });
}

async function verify(task) {
  const checks = (process.env.CODEX_VERIFY_COMMANDS || '')
    .split('||')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!checks.length) return true;
  for (const command of checks) {
    const code = await run(command, { CODEX_TASK_ID: task.meta.id });
    if (code !== 0) return false;
  }
  return true;
}

async function execute(task) {
  await updateTask(task, 'running');
  await logStatus([`${task.meta.id} running`, `scope=${task.meta.scope.join(',')}`]);
  if (dryRun) {
    await updateTask(task, 'ready');
    return { id: task.meta.id, result: 'dry-run' };
  }
  const prompt = `Work only on ${task.meta.id}: ${task.meta.title}. Read ${path.relative(root, task.full)}. Respect human gates and update no unrelated files.`;
  const code = await run(`${process.env.CODEX_AGENT_COMMAND} ${JSON.stringify(prompt)}`, {
    CODEX_TASK_ID: task.meta.id,
  });
  if (code !== 0) {
    await updateTask(task, 'failed');
    await logStatus([`${task.meta.id} failed`, `agent exit=${code}`]);
    return { id: task.meta.id, result: 'failed' };
  }
  await updateTask(task, 'verifying');
  const ok = await verify(task);
  await updateTask(task, ok ? 'done' : 'failed');
  await logStatus([`${task.meta.id} ${ok ? 'done' : 'verification failed'}`]);
  return { id: task.meta.id, result: ok ? 'done' : 'failed' };
}

while (true) {
  const tasks = await loadTasks();
  const human = tasks.filter((t) => t.meta?.status === 'ready' && t.meta.human_gate === true);
  const ready = readyTasks(tasks);
  console.log(
    JSON.stringify(
      {
        dryRun,
        maxParallel,
        humanGates: human.map((t) => t.meta.id),
        ready: ready.map((t) => t.meta.id),
      },
      null,
      2,
    ),
  );
  if (human.length) {
    await logStatus([`human gate pending: ${human.map((t) => t.meta.id).join(', ')}`]);
    break;
  }
  if (!ready.length || args.has('--graph') || args.has('--dry-run')) break;
  for (let i = 0; i < ready.length; i += maxParallel) {
    const batch = ready.slice(i, i + maxParallel);
    const results = await Promise.all(batch.map(execute));
    if (results.some((r) => r.result === 'failed')) {
      process.exitCode = 2;
      break;
    }
  }
  if (process.exitCode) break;
}
