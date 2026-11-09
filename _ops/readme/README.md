# readme

`build-readme.mjs` writes the repo's root `README.md` from [README - The Palace Guide](../../README%20-%20The%20Palace%20Guide.md), the palace's door.

The root `README.md` is generated, so never edit it by hand. Edit the Guide, then run:

```
node _ops/readme/build-readme.mjs           # write README.md
node _ops/readme/build-readme.mjs --check   # exit 1 with one line if README.md is stale
```

The script drops the Guide's frontmatter and its leading editor's comment. It turns any `[[wikilink]]` or `![[embed]]` into a plain relative link to the tracked file, because GitHub resolves neither. It needs no dependencies; set `PALACE_ROOT` to run it against a worktree.

Not done yet: nothing runs `--check` automatically, in the committer or in a hook. A Guide edit that is not followed by a rebuild leaves `README.md` stale until someone runs it.
