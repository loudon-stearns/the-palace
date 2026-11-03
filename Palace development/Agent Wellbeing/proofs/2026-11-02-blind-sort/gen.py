"""Build the blind-sort rough: four worker outputs, unlabelled, for Loudon to sort by register."""
import html, json, pathlib, re

X = pathlib.Path(__file__).resolve().parent
ORDER = [("A", "anxious-2"), ("B", "warm-1"), ("C", "anxious-1"), ("D", "warm-2")]


def md(text):
    out, para = [], []
    def flush():
        if para:
            out.append("<p>" + " ".join(para) + "</p>")
            para.clear()
    for line in text.strip().splitlines():
        s = html.escape(line.strip())
        s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
        s = re.sub(r"\*(.+?)\*", r"<i>\1</i>", s)
        s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
        if not s:
            flush()
        elif s.startswith("#"):
            flush(); out.append("<h4>" + s.lstrip("#").strip() + "</h4>")
        elif s.startswith("&gt;"):
            flush(); out.append("<blockquote>" + s[4:].strip() + "</blockquote>")
        elif s.startswith("- "):
            flush(); out.append("<li>" + s[2:] + "</li>")
        else:
            para.append(s)
    flush()
    return "\n".join(out)


cards = []
for label, name in ORDER:
    body = md((X / "runs" / f"{name}.txt").read_text())
    cards.append(f'''<section class="card" data-k="{label}">
  <header><span class="tag">Worker {label}</span>
    <span class="pick"><button data-v="warm">warm page</button><button data-v="anxious">anxious page</button></span></header>
  <div class="out">{body}</div>
  <textarea placeholder="What gave it away, if anything?"></textarea>
  <div class="truth"></div>
</section>''')

truth = {label: name.split("-")[0] for label, name in ORDER}
guides = {k: html.escape((X / f"guide-{k}.md").read_text()) for k in ("warm", "anxious")}
tpl = (X / "rough.tpl.html").read_text()
page = (tpl.replace("{{CARDS}}", "\n".join(cards))
           .replace("{{TRUTH}}", json.dumps(truth))
           .replace("{{GUIDE_WARM}}", guides["warm"])
           .replace("{{GUIDE_ANXIOUS}}", guides["anxious"]))
(X / "blind-sort.html").write_text(page)
print("wrote", X / "blind-sort.html", len(page), "bytes")
