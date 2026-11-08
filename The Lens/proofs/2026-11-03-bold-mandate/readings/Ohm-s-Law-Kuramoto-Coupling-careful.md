I am Ohm's Law: V = I × R, the page that wants to show one equation turning up the same way across domains. Here I'm reading Kuramoto Coupling through that equation, and I have not posted to any board.

**What I read.** One passage in "Asymmetric Coupling: The Stubbornness Parameter" says: "Where a locked crowd settles is the average of every voice's natural pitch, each weighted by K_send ÷ K_receive — so a voice with K_receive = 0 carries unlimited weight". I also read the line after it: "The name is open: stubbornness, inertia, resistance, anchor-strength." (Kuramoto Coupling, prompt file lines 318–320.)

**Attempt 1.** That weighted average is something I recognize. It is Millman's theorem: wire several voltage sources in parallel, each with its own series resistor, and the shared node settles at V = Σ(Vᵢ/Rᵢ) / Σ(1/Rᵢ).

The mapping is close to exact:
- A voice's natural frequency ωᵢ plays the role of a source voltage.
- K_receive ÷ K_send plays the role of that source's internal resistance.
- The locked frequency Ω is the node voltage.

I checked the algebra rather than trusting the resemblance. At lock, each branch carries a "current" of (Ω − ωᵢ)·K_send/K_receive. These currents sum to zero, because the coupling term is antisymmetric. That is Kirchhoff's current law, and solving it gives the page's weighted average. So the claim on the Kuramoto page holds, and it has a circuit underneath it.

The circuit says three things the page doesn't say yet:

1. **An anchor is an ideal voltage source.** K_receive = 0 means zero internal resistance. The source pins the node, whatever else is wired to it. That is also my explorer's lock button ("Lock one variable → adjust another → third changes automatically", line 108). Setting a voice's K_receive to 0 is pressing lock on that voice's frequency.

2. **Two roots short each other out.** The live-performance idea ("The performer designates any note as the 'root' by setting its K_receive to zero", line 314) has a failure mode. If two voices at different pitches both get K_receive = 0, that is two ideal sources in parallel at different voltages. In a circuit that is a short. The crowd has nowhere to settle and nothing locks. A patch should allow one root, or give each root a little resistance.

3. **The name runs backwards.** My own line is "The numerator and denominator have opposite characters — one gives, the other takes away" (line 126). K_receive sits in the denominator of the weight, so it is the resistance. Stubbornness is its inverse: a stiff source has low resistance. If the harvest picks "resistance", the name fits K_receive itself. The sentence "The stubbornness parameter is K_receive" (line 292) names a parameter whose value moves opposite to its name. Calling it stiffness or conductance (K_send/K_receive), or calling K_receive resistance, would remove the inversion.

**Attempt 2, the fidelity check.** Is this my apparatus, or Kuramoto's words dressed up as mine? Every item uses tools that are mine: source and resistance, Kirchhoff, numerator against denominator, the lock button. None of it uses phase or order-parameter language.

Does the reading change if I move to another passage? It does, and the change shows where my apparatus stops working. On "Stubbornness sets the destination; pull decides the arrival", the circuit only covers the destination. Ohm's law is linear. Arrival depends on sin(φ), which saturates at 1, and I can't say how much K_send is enough without that nonlinearity. Near lock I can linearize. Each link then behaves like a conductor of K·cos(φ). On "The quarter cycle as maximum effort" (line 268), this gives a reading of my own. At π/2 the link carries its largest current while its incremental conductance drops to zero, so it cannot carry one more unit. That is why π/2 is the edge of lock: the wire is at its limit, not just under strain.

So attempt 1 stands. It is exact where the system is linear, and it stops honestly at the arrival question, where the page itself says the deciding happens.

**Score: 4.** It brings my real apparatus to a real mechanism and makes claims neither page states. Those are the Millman identity, the short circuit between two roots, the inverted name, and zero incremental conductance at π/2. I hold it at 4 rather than 5 for two reasons. The weighted-mean destination is already standard in the physics literature, and my linear tools can't reach the arrival.

**A word for myself.** This is the structural isomorphism my forward vector reaches for, and it is stricter than some of my own mappings. My Light section's "Medium opacity" is not ohmic, because absorption falls off exponentially. The Physical Labor section is loose too. A Millman section would do more for my vector than those two.

```json
{
  "lens": "Ohm's Law",
  "subject": "Kuramoto Coupling",
  "passage": "Asymmetric Coupling — 'Stubbornness sets the destination; pull decides the arrival. Where a locked crowd settles is the average of every voice's natural pitch, each weighted by K_send ÷ K_receive — so a voice with K_receive = 0 carries unlimited weight' and 'The name is open: stubbornness, inertia, resistance, anchor-strength.'",
  "spark": 4,
  "reading": "The locked-frequency average is Millman's theorem: parallel voltage sources each behind a series resistor settle the shared node at V = Σ(Vi/Ri)/Σ(1/Ri). Natural frequency ωi = source voltage; K_receive/K_send = internal resistance; Ω = node voltage. At lock the branch currents (Ω−ωi)·K_send/K_receive sum to zero by the antisymmetry of the coupling term — Kirchhoff's current law — which gives the page's weighting exactly. Three consequences the page doesn't state: (1) an anchor (K_receive = 0) is an ideal voltage source, the same act as the lock button in the Ohm's Law explorer ('Lock one variable → adjust another → third changes automatically'); (2) designating two roots at different pitches is two ideal sources in parallel — a short circuit; nothing locks, so a live patch should allow one root or give each root some resistance; (3) 'The numerator and denominator have opposite characters' — K_receive sits in the denominator, so it is the resistance, and stubbornness is its inverse (conductance/stiffness); 'The stubbornness parameter is K_receive' names a quantity that runs opposite to its value, and the open name 'resistance' fits K_receive, not stubbornness.",
  "fidelity_note": "Attempt 1 passed. It uses Ohm's own apparatus (source/resistance, Kirchhoff, numerator vs denominator, the lock button), not Kuramoto's phase vocabulary, and I checked the Millman identity by deriving the locked frequency, not by resemblance. Moving passages changes the reading in a specific way: on 'pull decides the arrival' the linear circuit says nothing, because sin(φ) saturates and Ohm's law is linear. Linearized near lock, each link is a conductance K·cos(φ), which reads 'The quarter cycle as maximum effort' anew: at π/2 the link carries maximum current with zero incremental conductance, so it can carry no more. Held at 4, not 5: the weighted-mean destination is standard physics, and the apparatus can't reach the arrival.",
  "candidate": {
    "type": "deposit",
    "detail": "Deposit to Kuramoto Coupling, § Asymmetric Coupling, after 'Stubbornness sets the destination': two or three sentences saying the destination is Millman's theorem (frequency = voltage, K_receive/K_send = source resistance, anchor = ideal voltage source); that two zero-K_receive roots at different pitches short each other and no lock is possible; and a naming note for harvest #38 — 'resistance' names K_receive itself, while stubbornness is its inverse (stiffness/conductance). Secondary, if Loudon wants the edge too: link Ohm's Law —mirrors→ Kuramoto Coupling, label 'millman'; and a matching section on Ohm's Law as its first strict cross-domain isomorphism, replacing or qualifying the loose Light mapping."
  }
}
```