# online — the student link

Loudon teaches from Rational Hearing in online classes (his answer on 2026-11-10), not on a classroom projector. Sound through a video call is the weak link: the call compresses it, and its noise suppression may treat a steady sine drone as background hum. So the page can now send the sound itself.

**Link for students** (header button) copies a link that opens a student's own copy on what is sounding now: the partials (`?p=2-3`), the fundamental (`?f=A`), the ×5 magnify (`?mag=5`), and the last just-against-equal column played (`?ab=M3`, cleared by any change to the sound). `?theme` and `?present` pass through untouched. The student's copy opens with a banner, "Sent from class: …", and one tap starts the sound on their own speakers, because browsers will not play sound without a tap. An `ab` link plays the just dyad, then the tempered one, on that tap.

The link is built from wherever the page is opened. Opened from disk (`file://`), it works only on that computer, and the page says so. Opened from a web address, it works for anyone in the class.

- `check-student-link.mjs` builds three states on a teacher's copy (the fifth on the ladder; a 4:5:6 triad on A, magnified; the major third's A/B), copies the link, opens it as a student, and checks that state, banner, and the one tap all carry over. 17 checks, all passing on 2026-11-15, in headless Chromium.
- `check-student-link.json` holds the results.
- The three PNGs are the student's banner, the student's copy of the fifth, and the teacher's header after copying.

Not checked: any real call, any student's device, or how the drone survives Zoom's audio.
