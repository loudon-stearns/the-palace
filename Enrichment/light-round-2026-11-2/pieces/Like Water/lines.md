# Like Water — one rule, two grounds

**Title:** One rule, two grounds

**Caption:** The detour is not a second rule. Each drop does one thing, step downhill, and the code that moves it never names the rock; put a rise in the ground and the same rule bends around it. One nature, manifesting differently depending on context.

**What is real and what is a choice**
- Real: every path is computed, not drawn by hand. All fifteen drops, on both grounds, follow the one function `fall()` in `make.py`, which samples heights and steps the steepest way down. The word "rock" does not appear in it. The right panel differs from the left only by a mound added to the height function. All 15 drops reach the bottom on both grounds (`like-water-check.json`).
- Choice: the rule itself. It is steepest descent with a fixed step: no momentum, no pooling, and drops that never touch or merge. Real water carries speed, and it pools before it spills.
- Choice: where the frame ends. It stops before the two streams below the rock would draw back together in the trough, so the picture shows the parting, not the rejoining.
- Choice: the ground is invented, not measured. It is a plane falling top to bottom, plus a gentle trough down the middle (that is why the left-hand paths draw together), plus, on the right, a smooth round mound. Its height (a quarter of the slope's fall), width, and place are mine.
- Choice: the mound sits slightly right of the trough's floor (x = 0.515, not 0.5). This was a guard against a drop stopping at the balance point uphill of a perfectly centred mound. With this seed it turned out not to be needed: with the mound at 0.5, all 15 drops still reached the bottom. The offset is kept so the two streams are not mirror images.
- Choice: the shaded disc marks where the mound stands at least a quarter of its height above the slope around it. The rock's real edge is not sharp. The thin lines are contours of the very height function the drops read, one every 0.05.
- Choice: fifteen drops, evenly spaced with a small seeded jitter (seed 8), all released along the top edge. The step size is fixed, so the paths show direction, not speed.
- Not on the page: the two-panel comparison and the point that the rule never names the rock are the maker's demonstration of the page's sentence, not the page's own words. The caption's last sentence is the page's own, from The Six Domains ("one nature — self-coherence — manifesting differently depending on context").
- The rock does reach the rule, but only as heights: `fall()` samples the ground, and the ground includes the mound. What the rule lacks is any name or case for it.

**Leaking in:** none. The anchor sentence already carries the [[Lateral Access]] idea; nothing was borrowed from that page.

**Anchor:** "the detour around the rock is simply the form that downwardness takes here"

**Made with:** Drawn SVG; by hand, a seeded Python script (numpy, contourpy for the contour lines) that runs the descent, draws the SVG, and rasterises the PNG through headless Chrome.
