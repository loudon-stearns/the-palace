# palace-map-keeper — machinery

The keeper is an agent, not a page: its charter is `charter.md` here, its profile is `palace-map-keeper` in [[Agent Toolbox]] (generated into `.claude/agents/`), its tools are `_ops/swarm/palace-map.py` and `verify-triples.py`. [[Palace Map]] § Seeing and Counting says why it is shaped this way; the proof is [[Palace Map — proof — map-agent-test]].

**Spawn once, hold the ID, re-address.** From the session with Loudon, or from a ceremony that needs the whole map:

```
Agent(subagent_type: "palace-map-keeper", model: "sonnet", no name,
      prompt: "Read your charter at <palace>/_ops/palace-map-keeper/charter.md and boot as it says. Palace root: <palace>. Then: <the address>.")
```

Unnamed, so it stays a subagent and its result comes back whole with its token count. Every later address is a `SendMessage` to the held ID. Watch it with `node _ops/concierge/dial.mjs --tokens <N> --model sonnet`; the map at boot is about 32K tokens, and the test's creative runs reached 90–180K.

**Addresses it takes.** A constellation for a Daily Page sit or a Walk; a route on one relation for a Walk's door; a cast for a Dialectic; rhymes for a Weave (unjudged; flags only on Loudon's yes); the shape of a region. A plain fact can go to it, but the Concierge's `near` is cheaper.

**What comes back.** Findings with every edge a triple, an intuition log per creative move, the `verify-triples.py` count, and the build read. Relay it as returned; its finds are offers, and canon waits on Loudon.
