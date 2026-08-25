# Orchestrazione autonoma Codex

## Contract

The orchestrator reads task frontmatter, builds a dependency graph, selects unlocked tasks, reserves non-overlapping file scopes, dispatches bounded agents, runs verification, and updates status. It continues until all tasks are complete, no safe task is available, or a human gate is reached.

The reference runner is `orchestration/runner.mjs`. It is intentionally adapter-neutral: set `CODEX_AGENT_COMMAND` only in a controlled environment. Without it, `--dry-run` and graph diagnostics remain available.

## Statuses

`planned → ready → running → verifying → done`

Terminal or attention statuses: `blocked`, `blocked-human`, `failed`. A failed task is retried only according to its `max_attempts`; it is never skipped silently.

## Human gates

Task frontmatter may set `human_gate: true`. The runner will not dispatch it. It writes the gate reason to `STATUS.md` and stops the cycle. Gates include deploy, purchases, secrets, licensing approval, production migrations, destructive changes and external communications.

## Parallelism rules

- only `ready` tasks;
- dependencies must be `done`;
- no overlapping `scope` paths;
- max concurrency from `CODEX_MAX_PARALLEL` or 2;
- each agent gets one task and a bounded prompt;
- verification runs before dependents are unlocked.

## Required status record

Each task result records timestamp, agent id, commit/diff reference if available, commands, exit codes, acceptance criteria, blockers and next action. The runner does not commit or deploy on behalf of the user.
