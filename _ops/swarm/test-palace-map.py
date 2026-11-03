#!/usr/bin/env python3
"""
test-palace-map.py — holds palace-map.py to the Map Build's own rules.

The builder writes inbound_count / outbound_count on every node; `near --hops 1`
must see exactly those edges, for every node in the newest map. `path` must be
symmetric and never longer than the ring says. `diff` of a map against itself
must be empty. Run: python3 _ops/swarm/test-palace-map.py
"""
import glob, json, os, random, shutil, subprocess, sys, tempfile, unittest

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


# The map-agent test's ground truth ([[Palace Map — proof — map-agent-test]]) was
# read from the 2026-10-23 build. The pruner keeps three builds on disk, so the
# test takes that build from git, where every build lives.
PROOF_COMMIT = "4ad369c2"
PROOF_MAP = "_ops/maps/palace-map-full-2026-10-23.json"
PROOF_DIR = os.path.join(PALACE, "_ops", "Palace Map", "proofs", "2026-10-23-map-agent-test")
VERIFY = os.path.join(HERE, "verify-triples.py")

def git_map(tmp):
    out = os.path.join(tmp, os.path.basename(PROOF_MAP))
    r = subprocess.run(["git", "show", f"{PROOF_COMMIT}:{PROOF_MAP}"], capture_output=True, cwd=PALACE)
    if r.returncode != 0:
        return None
    with open(out, "wb") as f:
        f.write(r.stdout)
    return out

class KeeperTools(unittest.TestCase):
    """The baton of 2026-10-23: path --only, rhymes, connected, verify-triples."""
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp()
        cls.map = git_map(cls.tmp)
        if not cls.map:
            raise unittest.SkipTest(f"git cannot show {PROOF_COMMIT}:{PROOF_MAP}")

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def run_map(self, *args):
        return run(*args, "--map", self.map)

    def test_mirrors_only_route_is_four_hops_to_haptic_handwheel(self):
        r = self.run_map("path", "Kuramoto Coupling", "Haptic Handwheel", "--only", "mirrors")
        self.assertEqual(len(r["hops"]), 4)
        self.assertTrue(all(e["type"] == "mirrors" for e in r["hops"]))

    def test_mirrors_only_has_no_route_to_stoicism(self):
        r = self.run_map("path", "Kuramoto Coupling", "Stoicism", "--only", "mirrors")
        self.assertIsNone(r["hops"])
        unrestricted = self.run_map("path", "Kuramoto Coupling", "Stoicism")
        self.assertIsNotNone(unrestricted["hops"])

    def test_rhymes_set_hubs_aside_and_share_neighbours(self):
        r = self.run_map("rhymes", "Slime Mold Delay", "--n", "10")
        hubs = set(r["hubs_set_aside"])
        self.assertIn("FOUR PILLARS", hubs); self.assertIn("Kuramoto Coupling", hubs)
        self.assertTrue(r["rhymes"])
        for row in r["rhymes"]:
            self.assertNotIn(row["page"], hubs)
            self.assertGreaterEqual(len(row["shared"]), 3)
            self.assertFalse(hubs & set(row["shared"]))

    def test_rhyme_partners_have_no_edge_to_home(self):
        r = self.run_map("rhymes", "Songlines", "--n", "5")
        ring = self.run_map("near", "Songlines", "--hops", "1")["nodes"]
        for row in r["rhymes"]:
            self.assertNotIn(row["page"], ring)

    def test_hybrids_constellation_is_connected_across_four_types(self):
        pages = ["Iain McGilchrist", "Annie Dillard", "Merleau-Ponty", "Lateral Access",
                 "Frequency Domain ↔ Perspective Shift", "Pauline Oliveros", "Making a Palace Citizen"]
        r = self.run_map("connected", *pages)
        self.assertTrue(r["connected"])
        self.assertEqual(r["relation_types"], ["connects-to", "couples-with", "exemplifies", "mirrors"])

    def test_disconnected_set_names_its_pieces(self):
        r = self.run_map("connected", "Stoicism", "Granular Synthesis")
        self.assertFalse(r["connected"])
        self.assertEqual(len(r["components"]), 2)

    def test_flags_work_before_and_after_the_verb(self):
        a = subprocess.run([sys.executable, TOOL, "--json", "--map", self.map, "hubs", "--n", "3"], capture_output=True, text=True, cwd=PALACE)
        b = subprocess.run([sys.executable, TOOL, "hubs", "--n", "3", "--json", "--map", self.map], capture_output=True, text=True, cwd=PALACE)
        self.assertEqual(a.returncode, 0, a.stderr); self.assertEqual(a.stdout, b.stdout)

    def test_verify_triples_gives_the_proofs_counts(self):
        expected = {"hybrid/answers.md": (46, 46), "A-haiku-script.md": (31, 32), "G-sonnet-script-creative.md": (49, 49)}
        for name, (ok, total) in expected.items():
            f = os.path.join(PROOF_DIR, name)
            if not os.path.exists(f):
                self.skipTest(f"proof file missing: {name}")
            r = subprocess.run([sys.executable, VERIFY, f, "--map", self.map, "--json"], capture_output=True, text=True, cwd=PALACE)
            d = json.loads(r.stdout)["files"][0]
            self.assertEqual((d["real"], d["total"]), (ok, total), name)
            self.assertEqual(r.returncode, 0 if ok == total else 1, name)

if __name__ == "__main__":
    unittest.main(verbosity=1)
