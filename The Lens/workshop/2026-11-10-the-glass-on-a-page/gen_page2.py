import json, sys, re
ROOT = '/Users/loudonstearns/Documents/palace-hook-the-lens/'
SUBJ = 'Projects/Haptic Handwheel.md'
MPF = 'The Lens/proofs/2026-11-03-bold-mandate/readings/Merleau-Ponty-Haptic-Handwheel-bold.md'
subj = open(ROOT + SUBJ, encoding='utf-8').read()
mp = open(ROOT + MPF, encoding='utf-8').read()

def para(text, start):
    for p in text.split('\n\n'):
        if p.strip().startswith(start):
            return p.strip()
    raise SystemExit('no paragraph starts: ' + start)
def cut(p, a, b=None):
    i = p.index(a); j = (p.index(b) + len(b)) if b else len(p)
    return p[i:j]

P = [
  {'id': 'p1', 'sec': 'The claim', 'text': para(subj, 'That last sentence is the fault being fixed.')},
  {'id': 'p2', 'sec': 'Two kinds of force', 'text': para(subj, 'A string, a fret or a spring **answers the hand**')},
  {'id': 'p3', 'sec': 'Feedback folded into the control', 'text': para(subj, 'A knob with a light beside it is two parts')},
  {'id': 'p4', 'sec': 'Feedback folded into the control', 'text': para(subj, 'One question stays open.')},
]
last = para(mp, 'Last, the motor that senses and pushes.')
mp_r = {
  'p1': [para(mp, 'Then the pitch wheel,')],
  'p2': [cut(last, 'Your knob is that fold made of copper and magnets')],
  'p3': [cut(last, 'Last, the motor', 'never happens in fact.')],
  'p4': [para(mp, 'Your page ends its best section on a doubt.'), cut(para(mp, 'So the question is not one feel or many.'), 'So the question', 'are a family.')],
}
mpj = json.loads(mp[mp.index('```json') + 7: mp.rindex('```')])

R = {
 'spinoza': {
  'p1': "DEFINITION. By a thing's striving, understand what it does to stay what it is.\nPROPOSITION. The wheel's spring strives for one thing only, its centre. The string strives toward its own rest at every point of the bend.\nDEMONSTRATION. A force the hand meets is another thing's striving, felt. The wheel's does not vary with the note, so the hand has an effect with no knowledge of its cause. The string's does vary, so the hand comes to know the cause.\nCOROLLARY. The fault being fixed is an ignorance, and the fix is an increase in the player's power to act. Q.E.D.",
  'p2': "PROPOSITION. A feel that answers the hand is hand and motor acting as one body.\nDEMONSTRATION. Bodies make one individual when they pass their motions to each other in a fixed ratio. Delay breaks the ratio: the motor answers where the hand was. Each is then pushed about by the other from outside, and the spring is unstable.\nCOROLLARY. Compute the stiff feel at the motor, where the two can be one thing.\nSCHOLIUM. A soft feel asks for little agreement, so it may cross the cable.",
  'p3': "PROPOSITION. The knob and the light are not two things, a mover and a teller. They are one thing under two descriptions.\nDEMONSTRATION. Mind and body are one thing seen from two sides; the order of doing and the order of knowing are the same order. A design that puts the doing in a knob and the knowing in a light treats them as two substances signalling across a gap.\nCOROLLARY. Folding the feedback into the control adds nothing. It removes the gap. Q.E.D.",
  'p4': "PROPOSITION. The open question is whether the hand's knowledge of the knob can be adequate.\nDEMONSTRATION. An idea is adequate when it holds the cause along with the effect. A feel that changes with each parameter is known adequately if the hand knows what changes it, and confusedly if the hand only suffers the change.\nSCHOLIUM. So the test is not stable against shifting. Ask whether the player meets each new feel with more power to act, or less. Joy is the sign of the first, and only the one playing can report it.",
 },
 'simondon': {
  'p1': "A pitch wheel is an abstract object: one part to move the pitch, and a separate spring whose only job is to bring the wheel home. The two know nothing of each other. On a string the same tension makes the pitch and makes the force. One structure, two jobs, and that is why the string is the more finished being. Read it as a lineage: the string, then the wheel and its spring, then this knob. The knob is the wheel trying to become as concrete as the string it descends from.",
  'p2': "Where a function has to be computed is the object telling you where its parts want to fuse. \"The stiffer the feel, the closer to the motor\": the sensing, the sum and the push are converging on one place, and the cable is what is left of the bag of parts. An unstable spring is a tension in the design that has not been resolved yet. The object is asking for a motor that carries its own stiff feels, with the cable kept for what can afford to arrive late.",
  'p3': "Your page has this right and stops one step short. A motor that senses and pushes is two jobs in one part. Count again. By your own list it is also the string, the fret, the platter and the spring, and it is the speaker that plays the LFO into the hand. Now ask the same question of every part left over. The light is gone. What else is still a separate thing doing one job? The cable. The buttons. The cap, whose weight the motor already models.",
  'p4': "A feel that \"stays put\" is a finished individual. A knob whose feel changes with what it touches still carries its charge: it has not finished becoming one thing. Do not ask the hand to absorb that all at once. Technical objects settle by generations, and this one might too: a few feels first, each kept until hand and knob have grown into each other, then the next one grown from it. The lineage is the answer to the shifting surface, and playing is how each generation gets made.",
 },
 'deleuze': {
  'p1': "The wheel's spring measures distance from a centre. Identity first: every position is a deviation from home, and nothing in the spring differs from note to note. A string is a gradient. Its tension is not the same anywhere along the bend, and the hand reads the difference, never the position. So the fix is to stop returning the hand to an origin and give it an intensity to lean into. Even that force out and the pitch information is gone.",
  'p2': "Two machines hide in this sentence. In one the force is a function of the hand, a loop. In the other the patch pours a signal in. The loop lives on a kept difference, between where the hand is and where the spring says it should be. Delay does not weaken that difference. It lets the difference feed on itself until the knob bucks. The instability is the same intensity that makes the feel, with nothing shaping it. The design question is how much of it to keep.",
  'p3': "Before the fold there are two identities, a control and a display, and a relation added afterwards. After it there is only the relation: one motor, in which sensing and pushing are told apart by direction and nothing else. The page calls this better made. Call it also less finished. A part with one job is done. A part that senses and pushes holds every feel it could give, string, fret, platter, spring, and gives one at a time.",
  'p4': "Bass frets never move. That is identity, and the page is right to feel its pull. But the hand never absorbed the frets. It absorbed the differences between them, which is why a different bass is still a bass to the hand. A knob that changes its feel with every parameter is a problem only if each feel has to be recognised as the same one again. Let the hand learn the changes themselves. What \"only playing will show\" is which differences it can ride.",
 },
}

RUN_MINE = "lens run 2026-11-10 -- written by the maker session (claude-fable-5-2) with {glass}, Projects/Haptic Handwheel.md and the mandate in lens-mandate.js loaded. not woken through [L]ens: the glass page was read, not booted as an agent, and a real lensing picks one passage of its own where this run was pointed at four. never posted to the board."
EYES = {
 'mp': {'name': 'Merleau-Ponty', 'page': 'Merleau-Ponty.md', 'real': True,
   'run': "woken 2026-11-03 -- a real lensing: an agent (Opus 5.5) woke as the Merleau-Ponty page through buildLensMandate, bold, and was handed Haptic Handwheel whole. excerpts, word for word, from " + MPF + " (commit 996f3c0d). a test run: never posted to the board.",
   'r': mp_r,
   'spark': mpj['spark'], 'payoff': mpj['candidate']['type'],
   'detail': mpj['candidate']['detail'].split(' The organist adapts')[0],
   'distortion': mpj['distortion_check'][mpj['distortion_check'].index('The glass:'):],
   'doorway': mpj['doorway'],
   'after': "a cold fact-check afterwards (fact-check.md, item 6): the Schneider analogy runs backwards and was not flagged; the organist's \"mournful voice down to the left\" is invented colour, so \"Nothing invented\" is not quite true; the spark of 4 is \"a shade high\".",
   'flags': {'p1': "fact-check, item 6: this analogy runs backwards. Schneider kept grasping and lost pointing; a wheel that demands pointing asks for what Schneider could not do. The reading's own distortion check missed it."}},
 'spinoza': {'name': 'Spinoza', 'page': 'People/Spinoza.md', 'real': False, 'run': RUN_MINE.format(glass='People/Spinoza.md'), 'r': {k: [v] for k, v in R['spinoza'].items()},
   'spark': 3, 'payoff': 'learn',
   'detail': "No edge and no deposit. What a reader takes away: the pitch wheel's fault can be said as an ignorance of a cause, and the open question as one the player answers by whether power to act rose.",
   'distortion': "The glass: the proposition form is dress. The fixed ratio of motion and the adequate idea are from the Ethics and are not on the palace's Spinoza page. Haptic Handwheel says nothing about joy or power to act. Nothing here has been tested by a hand.",
   'doorway': "People/Spinoza.md, the section on the question brought into any room: what is the striving here, and whose?", 'after': None, 'flags': {}},
 'simondon': {'name': 'Simondon', 'page': 'Simondon.md', 'real': False, 'run': RUN_MINE.format(glass='Simondon.md'), 'r': {k: [v] for k, v in R['simondon'].items()},
   'spark': 3, 'payoff': 'deposit',
   'detail': "Haptic Handwheel, where it cites Simondon: the motor does more than two jobs by the page's own list (sensor, pusher, string, fret, platter, spring, and the speaker for what is played into the hand). Count them, and ask the same of the cable, the buttons and the cap. Modest: the page already makes the two-jobs point.",
   'distortion': "The glass: the descent string, wheel, knob is the glass's lineage; the page gives none. \"A few feels first, by generations\" is an extension nobody has tested. The page does not say the cable is a leftover part; it says soft feels can cross it.",
   'doorway': "Simondon.md, the lens on the technical work: concretization as the design metric.", 'after': None, 'flags': {}},
 'deleuze': {'name': 'Deleuze', 'page': 'Deleuze.md', 'real': False, 'run': RUN_MINE.format(glass='Deleuze.md'), 'r': {k: [v] for k, v in R['deleuze'].items()},
   'spark': 3, 'payoff': 'link',
   'detail': "A candidate edge that does not exist today: Haptic Handwheel -- connects-to -- Deleuze [force-as-intensity]. The Deleuze page already says a knob selects an intensity; this page builds a knob where that intensity is felt.",
   'distortion': "The glass: \"a different bass is still a bass to the hand\" is a guess, with no source. Calling instability \"the same intensity that makes the feel\" bends the page, which treats delay only as a fault. \"Less finished\" is the glass's praise, not the page's.",
   'doorway': "Deleuze.md, the lens on the technical work: the knob is not choosing a setting, it is selecting an intensity.", 'after': None, 'flags': {}},
}
DATA = {'subject': SUBJ, 'subject_commit': sys.argv[1], 'mp_file': MPF, 'passages': P, 'eyes': EYES, 'order': ['mp', 'spinoza', 'simondon', 'deleuze']}
tpl = open(sys.argv[2], encoding='utf-8').read()
out = tpl.replace('/*DATA*/', json.dumps(DATA, ensure_ascii=False, indent=1).replace('</', '<\\/'))
open(ROOT + 'The Lens/The Lens — rich — the glass on a page.html', 'w', encoding='utf-8').write(out)
print('ok', len(out), [len(p['text']) for p in P])
