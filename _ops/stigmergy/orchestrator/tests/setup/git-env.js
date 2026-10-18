// No test inherits a GIT_* variable. A hook or `git rebase -x` that runs the suite hands it GIT_DIR,
// and the git the code under test runs in-process (cycle-commit, ledger, scroll-file, shop-roster,
// two-paths-merge, and the palace-commit cycle-commit spawns) reads this worker's env, which a
// test's own gitFreeEnv() never reaches. The reason in full is in tests/helpers/git-env.js.

for (const k of Object.keys(process.env)) if (k.startsWith('GIT_')) delete process.env[k];
