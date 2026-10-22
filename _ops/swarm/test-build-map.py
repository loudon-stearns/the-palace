#!/usr/bin/env python3
"""
test-build-map.py — holds build-map.py to its two promises: it runs the newest
dated builder, and it keeps only the N newest builds in the output folder.
The builder is run for real into a temp folder. Run: python3 _ops/swarm/test-build-map.py
"""
import importlib.util, os, re, shutil, subprocess, sys, tempfile, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
PALACE = os.path.dirname(os.path.dirname(HERE))
SHIM = os.path.join(HERE, "build-map.py")
spec = importlib.util.spec_from_file_location("build_map", SHIM)
bm = importlib.util.module_from_spec(spec); spec.loader.exec_module(bm)

class BuildMapShim(unittest.TestCase):
    def test_newest_builder_is_the_latest_date(self):
        with tempfile.TemporaryDirectory() as d:
            for n in ("build-map-2026-04-27.py", "build-map-2026-09-24.py", "build-map-2026-06-05.py", "build-map.py"):
                open(os.path.join(d, n), "w").close()
            self.assertEqual(os.path.basename(bm.newest_builder(d)), "build-map-2026-09-24.py")

    def test_prune_keeps_newest_three_and_all_their_formats(self):
        with tempfile.TemporaryDirectory() as d:
            for date in ("2026-03-27", "2026-06-05", "2026-09-24", "2026-09-26", "2026-10-22"):
                for suf in (".json", ".tsv", "-adjacency.txt"):
                    open(os.path.join(d, f"palace-map-full-{date}{suf}"), "w").close()
            open(os.path.join(d, "palace-map-2026-03-27.html"), "w").close()   # not a build; untouched
            removed = bm.prune(d, 3)
            left = sorted(os.listdir(d))
            self.assertEqual(len(removed), 6)
            self.assertNotIn("palace-map-full-2026-03-27.json", left)
            self.assertNotIn("palace-map-full-2026-06-05.tsv", left)
            self.assertIn("palace-map-full-2026-09-24.json", left)
            self.assertIn("palace-map-full-2026-10-22-adjacency.txt", left)
            self.assertIn("palace-map-2026-03-27.html", left)

    def test_runs_the_builder_into_out_dir_and_prunes(self):
        with tempfile.TemporaryDirectory() as d:
            for date in ("2026-01-01", "2026-01-02", "2026-01-03"):
                open(os.path.join(d, f"palace-map-full-{date}.json"), "w").close()
            r = subprocess.run([sys.executable, SHIM, "--out-dir", d, "--date", "2099-12-31"],
                               capture_output=True, text=True, cwd=PALACE)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertTrue(os.path.exists(os.path.join(d, "palace-map-full-2099-12-31.json")))
            dates = sorted({m.group(1) for n in os.listdir(d) for m in [bm.BUILD.match(n)] if m})
            self.assertEqual(dates, ["2026-01-02", "2026-01-03", "2099-12-31"])
            self.assertIn("kept the 3 newest", r.stdout)

if __name__ == "__main__":
    unittest.main(verbosity=1)
