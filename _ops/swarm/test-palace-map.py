#!/usr/bin/env python3
"""
test-palace-map.py — holds palace-map.py to the Map Build's own rules.

The builder writes inbound_count / outbound_count on every node; `near --hops 1`
must see exactly those edges, for every node in the newest map. `path` must be
symmetric and never longer than the ring says. `diff` of a map against itself
must be empty. Run: python3 _ops/swarm/test-palace-map.py
"""
import glob, json, os, random, subprocess, sys, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
PALACE = os.path.dirname(os.path.dirname(HERE))
TOOL = os.path.join(HERE, "palace-map.py")
MAPS = sorted(glob.glob(os.path.join(PALACE, "_ops", "maps", "palace-map-full-*.json")))

def run(*args):
    r = subprocess.run([sys.executable, TOOL, "--json", *args], capture_output=True, text=True, cwd=PALACE)
    if r.returncode != 0:
        raise AssertionError(r.stderr.strip() or r.stdout.strip())
    return json.loads(r.stdout)

@unittest.skipUnless(MAPS, "no palace map JSON in _ops/maps/")
class PalaceMapTool(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(MAPS[-1], encoding="utf-8") as f:
            cls.m = json.load(f)
        cls.nodes = {n["id"]: n for n in cls.m["nodes"]}
        cls.date = cls.m["meta"]["generated"]

    def test_near_matches_builder_degree_for_every_node(self):
        for nid, n in self.nodes.items():
            r = run("near", nid, "--hops", "1")
            # The builder's degree counts node-to-node edges only; an edge to a
            # bundle file or a page not yet written is in the list, not the count.
            out = sum(1 for e in r["edges"] if e["source"] == nid and e["target"] in self.nodes)
            inn = sum(1 for e in r["edges"] if e["target"] == nid and e["source"] in self.nodes)
            self.assertEqual((out, inn), (n["outbound_count"], n["inbound_count"]), nid)
            self.assertTrue(r["map"].endswith(os.path.basename(MAPS[-1])))

    def test_path_is_symmetric_and_bounded_by_ring(self):
        rng = random.Random(1)
        ids = sorted(self.nodes)
        for _ in range(20):
            a, b = rng.sample(ids, 2)
            ab, ba = run("path", a, b), run("path", b, a)
            if ab.get("path", 1) is None:
                self.assertIsNone(ba.get("path", 1)); continue
            self.assertEqual(len(ab["hops"]), len(ba["hops"]), (a, b))
            dist = run("near", a, "--hops", str(len(ab["hops"])))["nodes"]
            self.assertIn(b, dist)

    def test_diff_of_self_is_empty(self):
        r = run("diff", self.date, self.date)
        for k in ("nodes_born", "nodes_gone", "edges_formed", "edges_dissolved", "stage_changes", "inbound_changes", "ghosts_closed", "ghosts_new"):
            self.assertEqual(r[k], [], k)

    def test_hubs_sorted_by_inbound(self):
        h = run("hubs", "--n", "10")["hubs"]
        self.assertEqual([x["inbound"] for x in h], sorted((x["inbound"] for x in h), reverse=True))

    def test_unknown_entry_fails_loudly(self):
        with self.assertRaises(AssertionError):
            run("near", "No Such Entry Anywhere")

if __name__ == "__main__":
    unittest.main(verbosity=1)
