# headless — the older renderers

`physarum_flow.py` and `physarum_fdn.py` are the offline renderers from June and October
2026. They run the flow law as it stood before the 'compete' law of cycle 11 (thickness
growing faster than flow, the flakes taking turns), so what they render is not what the
flow dish or the plugin grows. Keep them for the record; don't render from them.

The offline home of the current law is the plugin's `../plugin/reference/sketch.py`, which
the plugin matches sample for sample (`../plugin/plugin.sh verify`). To render dishes from
recordings, use `../plugin/bank.py`: it runs the plugin's own processor and draws the roads
it grew.

The `mesh_dish_check.mjs` and `flow_dish_*check.mjs` scripts still check the browser flow
dish and stay current.
