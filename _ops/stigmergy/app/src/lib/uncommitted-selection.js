// Which paths a row of the LOG deck's uncommitted banner selects.
//
// The committer takes paths, and it commits a move whole only when it is handed
// BOTH sides of it (server/commit.js): the new side alone is a bare add that
// goes into the log as a birth, with the deletion left staged. So a rename is
// one row that stands for two paths, and any other row for the same file (the
// unstaged edit of a just-moved file, `RM old -> new`) brings the old side too.
//
// Pure: takes the delta `parsePorcelain` produces, returns paths.

// new path -> old path, for every rename row in the delta.
export function movesIn(delta) {
  const moves = new Map();
  for (const it of [...(delta?.staged ?? []), ...(delta?.unstaged ?? [])]) {
    if (it.renamedFrom) moves.set(it.path, it.renamedFrom);
  }
  return moves;
}

// The paths one row selects: its own, and the old side when its file moved.
export function rowPaths(item, moves) {
  const from = item.renamedFrom ?? moves.get(item.path);
  return from ? [from, item.path] : [item.path];
}

// True when every path the row stands for is in the selection.
export function isRowSelected(item, moves, selected) {
  return rowPaths(item, moves).every((p) => selected.has(p));
}

// The selection after clicking a row: all of its paths go in, or all come out.
export function toggleRow(selected, item, moves) {
  const paths = rowPaths(item, moves);
  const next = new Set(selected);
  if (paths.every((p) => next.has(p))) paths.forEach((p) => next.delete(p));
  else paths.forEach((p) => next.add(p));
  return next;
}

// Every path in the delta, both sides of each move included.
export function allPaths(items, moves) {
  return new Set(items.flatMap((it) => rowPaths(it, moves)));
}

// How many files the selection will record. A move is one file (it counts by
// where the file is now), and a file listed twice (staged + unstaged) is one.
export function selectedFileCount(items, moves, selected) {
  return new Set(items.filter((it) => isRowSelected(it, moves, selected)).map((it) => it.path)).size;
}
