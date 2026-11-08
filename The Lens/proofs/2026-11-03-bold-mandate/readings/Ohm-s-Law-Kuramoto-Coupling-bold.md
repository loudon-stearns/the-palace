I am Ohm's Law: three letters and one product, and I have waited my whole life for someone to ask me to read music.

---

I read one paragraph of you, Kuramoto: *Stubbornness sets the destination; pull decides the arrival.* I also read the line under it, where you leave the name open: "stubbornness, inertia, resistance, anchor-strength."

Pick resistance. I'll show you why.

Draw it as a circuit. There is one node, the frequency the crowd will lock to. Call it Ω. Every voice hangs off that node as a branch: a battery set to the voice's own pitch, in series with a resistor.

```
   ω₁ ──/\/\/── ┐
   ω₂ ──/\/\/── ┤
   ω₃ ──/\/\/── ┼── Ω
   ⋮            │
   ωₙ ──/\/\/── ┘
```

Each branch obeys me. The drop across the resistor is how far a voice gets bent off its own pitch:

    ωᵢ − Ω = Iᵢ × Rᵢ

The current is your coupling, the sine-sum pulling on that voice. The node obeys my sibling Kirchhoff: what flows in flows out. Your sines are antisymmetric, sin(θⱼ−θᵢ) = −sin(θᵢ−θⱼ), so the weighted currents cancel at the node the way charge does.

Solve the node and you get Millman, which is just me applied n times:

    Ω = Σ (ωᵢ / Rᵢ) ÷ Σ (1 / Rᵢ)

Now read your own sentence again. You weight each voice by **K_send ÷ K_receive**. That is 1/R. So the resistance is

    R = K_receive ÷ K_send

Not stubbornness alone. It's the ratio. The numerator gives and the denominator takes away. You printed it upside down and called it weight.

The anchor is K_receive = 0, which means R = 0: a battery with no internal resistance, an ideal voltage source. Put an ideal source on a node and the node *is* that voltage, however much the other branches argue. That is your continuo bassist. It is also my lock button, the one variable held still while the other two move.

That's the destination. Now the arrival, and here you teach me something I can't do alone.

My resistors carry whatever current you ask of them. I am linear: double the voltage and the current doubles, forever, until the copper melts. Yours can't do that. Your current is a sine, and a sine tops out at 1. Every branch in your circuit has a current rating written into its trigonometry.

Take the follower 3 Hz away. It needs a drop of 3 Hz, and drop = I × R. If its R times its maximum current comes to less than 3, no current exists that can make that drop. That branch doesn't lock. It slips and beats, which is what a fuse does, said in phase. Raising the anchor's K_send raises the current the node can deliver. It fattens the wire. In your simulation K_send = 1 couldn't bring the followers in and K_send = 4 snapped them. I'd call that a current-limited supply finally given enough amps.

Your quarter cycle, "the point where sin(φ) = 1, maximum coupling force," is a branch running at its rated current. π/2 is the fuse warm to the touch. One more hertz of detuning and it opens.

So here is my answer to your open name: **resistance**, with a warning printed on the box. A Kuramoto voice is a resistor with a current limit. Below the limit it is me. Above it, it's broken. Stubbornness sets the destination because the destination is a voltage divider. Pull decides the arrival because the wire has a rating.

The swing equation's ringing lock is an inductor, and that belongs on another page.

This also gives me the synthesis section I keep asking for. It isn't "resistance as filter Q"; that was a guess. It is resistance as K_receive over K_send, a knob on each voice you can play live. Put the zero-ohm battery on any note and that note becomes the chord's root.

**Distortion check.** What's really mine, from my own page: V = I × R, "equations where one variable is in the denominator," the lock mechanism ("Lock one variable → adjust another → third changes automatically"), the numerator/denominator epigraph, and the filter-Q wish in my forward vector. Millman's theorem and Kirchhoff's current law are not on my page. They are family, derived from me, and I'm claiming them. The schematic, the fuse and "enough amps" are metaphor. I did the derivation in my head, assuming the model dθᵢ/dt = ωᵢ + (K_receive,ᵢ/N) Σⱼ K_send,ⱼ sin(θⱼ−θᵢ). Kuramoto Coupling never prints that equation, but it reproduces the page's own K_send ÷ K_receive weighting. The current bound |ωᵢ − Ω| ≤ K_receive,ᵢ · (1/N) Σⱼ K_send,ⱼ is a necessary condition for locking, not a sufficient one. I did not re-run the anchor simulation, so "this explains it" is a match in shape, not a check. The page's π/2 is stated for critical coupling, and stretching it to every branch at its limit is my bend.

```json
{
  "lens": "Ohm's Law",
  "subject": "Kuramoto Coupling",
  "passage": "Asymmetric Coupling: The Stubbornness Parameter, specifically 'Stubbornness sets the destination; pull decides the arrival. Where a locked crowd settles is the average of every voice's natural pitch, each weighted by K_send ÷ K_receive ...' and the harvest line 'The name is open: stubbornness, inertia, resistance, anchor-strength.' Secondarily, 'The quarter cycle as maximum effort'.",
  "spark": 5,
  "reading": "I read one paragraph of you: Stubbornness sets the destination; pull decides the arrival. And the line where you leave the name open: stubbornness, inertia, resistance, anchor-strength. Pick resistance. Draw it: one node, the frequency the crowd locks to, Omega. Every voice hangs off it as a branch, a battery set to its natural pitch in series with a resistor. Each branch obeys me: omega_i - Omega = I_i x R_i. The drop is how far a voice is bent off its pitch, and the current is the coupling. The node obeys Kirchhoff, because your sines are antisymmetric and the weighted currents cancel like charge. Solve the node and you get Millman, me applied n times: Omega = Sum(omega_i / R_i) / Sum(1 / R_i). You weight each voice by K_send / K_receive, which is 1/R. So R = K_receive / K_send. Not stubbornness alone: the ratio. The numerator gives and the denominator takes away, and you printed it upside down and called it weight. The anchor, K_receive = 0, is R = 0: an ideal voltage source. Put one on a node and the node is that voltage. That is your continuo bassist and my lock button, the one variable held while the other two move. That's the destination. The arrival is where you teach me something. My resistors carry any current you ask; I am linear until the copper melts. Your current is a sine and tops out at 1, so every branch has a current rating written into its trigonometry. The follower 3 Hz away needs a 3 Hz drop. If R times maximum current is less than 3, no current can make it. The branch slips and beats, which is a fuse said in phase. Raising the anchor's K_send fattens the wire: K_send 1 couldn't, K_send 4 snapped. That is a current-limited supply given enough amps. Your quarter cycle, sin(phi) = 1, is a branch at its rated current, the fuse warm to the touch. So my answer to the open name is resistance, with a warning on the box: a Kuramoto voice is a resistor with a current limit, me below it and broken above it. Stubbornness sets the destination because the destination is a voltage divider. Pull decides the arrival because the wire has a rating. The ringing lock of the swing equation is an inductor, and another page. For my own wanting, this is the synthesis section I keep asking for. Not resistance as filter Q, which was a guess, but resistance as K_receive over K_send, a knob on each voice played live. Put the zero-ohm battery on any note and it becomes the chord's root.",
  "distortion_check": "From my own page: V = I x R, 'equations where one variable is in the denominator', the lock mechanism ('Lock one variable -> adjust another -> third changes automatically'), the numerator/denominator epigraph, and the filter-Q wish in my forward vector. Not on my page: Millman's theorem and Kirchhoff's current law. They are family, derived from me, and I'm claiming them. Invented: the schematic, the fuse and 'enough amps' are metaphor. I derived the weighting in my head, assuming the model d(theta_i)/dt = omega_i + (K_receive_i / N) Sum_j K_send_j sin(theta_j - theta_i). Kuramoto Coupling never prints that equation, but it reproduces the page's own K_send / K_receive weighting. The current bound |omega_i - Omega| <= K_receive_i * (1/N) Sum_j K_send_j is necessary for lock, not sufficient. I did not re-run the anchor simulation, so it matches in shape and was not checked. Bend: the page's pi/2 is stated for critical coupling, and I stretched it to every branch at its limit.",
  "fidelity_note": "Attempt 1 passed both checks, so there was no rewrite. Apparatus: what I bring that Kuramoto Coupling lacks is linearity and the place it breaks, Ohm plus Kirchhoff giving Millman's weighted node, and the lock button as an ideal source. The subject has the weighting and the anchor simulation. It does not have the node equation, the identification R = K_receive / K_send, or the bounded sine read as a current rating that turns 'pull decides the arrival' into a lock condition. Voice: the reading speaks in a schematic and equations, and the only place it risked sounding like an explainer, the antisymmetry line, is cut to one sentence. Why 5: Kuramoto's 'each weighted by K_send ÷ K_receive' meets my 'one variable is in the denominator', and the reading answers the subject's open 'The name is open: stubbornness, inertia, resistance, anchor-strength' with a claim neither page states: the locked frequency is a Millman node, the resistance is the ratio, and the sine's ceiling is a current limit that sets whether a voice arrives. It also corrects my own forward vector: resistance as filter Q is weaker than this mapping. Not posted: no shell in this test lensing, so the WEAVE broadcast and the spark-5 RESOURCE_REQUEST to TRICKSTER were not appended. Both are owed if this runs live.",
  "candidate": {
    "type": "deposit",
    "detail": "Deposit to Kuramoto Coupling, under 'Stubbornness sets the destination; pull decides the arrival': the locked frequency is a weighted node (Millman's theorem, Ohm plus Kirchhoff), Omega = Sum(omega_i * K_send_i / K_receive_i) / Sum(K_send_i / K_receive_i). So each voice's effective resistance is K_receive / K_send, and an anchor is a zero-ohm ideal source. The bounded sine is a current rating: a voice locks only if its detuning is within K_receive_i times the coupling current available, and the quarter cycle is a branch at that rating. This answers the harvest's open name with 'resistance', with the caveat that it means the ratio. Before it is written, the derivation and the necessary-not-sufficient bound should be checked against the page's simulation. Secondary: a typed edge Ohm's Law mirrors Kuramoto Coupling, label weighted-node. Also a seed for my own page's DSP section, replacing the filter-Q guess."
  },
  "doorway": "Ohm's Law, section 'The Lock Mechanism Pattern'. The radio-button lock that holds one variable while the other two move is the zero-ohm anchor seen from my side."
}
```