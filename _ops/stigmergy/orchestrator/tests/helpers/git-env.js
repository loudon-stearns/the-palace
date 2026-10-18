// A test's git must never reach the palace's own repository.
//
// Git sets GIT_DIR, absolute, for hooks such as pre-commit and pre-push and for `git rebase -x`,
// and GIT_WORK_TREE, GIT_INDEX_FILE, GIT_COMMON_DIR, GIT_OBJECT_DIRECTORY and GIT_CONFIG_PARAMETERS
// can be inherited too. A suite run under any of them would aim every git call it makes, and every
// palace-commit it spawns, at the real repository instead of the throwaway one: a Sentry test once
// turned `git init --bare` into core.bare=true on the shared repo.
//
// So a test builds each child's env with gitFreeEnv(), and checks each throwaway repo with
// assertScratchRepo() before anything is written to it. The same rule as the app's tests
// (../../../app/tests/helpers/git-env.js) and the Sentry's (_ops/sentry/tests/messages.test.mjs).
// tests/setup/git-env.js drops the same keys from the worker's own env, for the git the code
// under test runs in-process (the committer, the ledger, the scroll, the roster, the merge).

import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { sep } from 'node:path';

/** process.env with every GIT_* key dropped, then `extra` on top. */
export function gitFreeEnv(extra = {}) {
  return {
    ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))),
    ...extra,
  };
}

/** Throws unless git, run in `repo`, finds its common dir inside `within` (the test's temp dir). */
export function assertScratchRepo(repo, within = repo) {
  const dir = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: repo, env: gitFreeEnv(), encoding: 'utf8' }).trim();
  if (!dir.startsWith(realpathSync(within) + sep)) throw new Error(`git is not aimed at the scratch repo: ${repo} resolves to ${dir}`);
}
