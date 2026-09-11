const docs = [
  {
    title: "Refund policy.md",
    chunks: [
      "Customers may request a full refund within 14 days of purchase if the product is unused.",
      "Refunds are processed to the original payment method within 5–7 business days.",
      "Digital downloads are only refundable if the file failed to deliver.",
    ],
  },
  {
    title: "Onboarding guide.md",
    chunks: [
      "New team members receive access on day one after IT provisions email and GitHub.",
      "Complete the security training module before requesting production credentials.",
      "Your manager schedules a 30-minute kickoff in the first week.",
    ],
  },
  {
    title: "API notes.md",
    chunks: [
      "All authenticated routes expect a Bearer JWT in the Authorization header.",
      "Rate limit is 100 requests per minute per user on the public API.",
      "Health check is available at GET /health and does not require auth.",
    ],
  },
];

function score(query, text) {
  const q = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const t = text.toLowerCase();
  let s = 0;
  q.forEach((w) => {
    if (t.includes(w)) s += 1;
  });
  return s;
}

function retrieve(query, k = 3) {
  const scored = [];
  docs.forEach((d) => {
    d.chunks.forEach((c, i) => {
      scored.push({ doc: d.title, text: c, score: score(query, c), i });
    });
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function answer(query, hits) {
  if (!hits.length) {
    return "I couldn’t find anything relevant in the sample docs. Try asking about refunds, onboarding, or the API.";
  }
  const joined = hits.map((h) => h.text).join(" ");
  return `Based on the retrieved sections: ${joined}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

document.getElementById("docs").innerHTML = docs
  .map(
    (d) =>
      `<div class="item"><strong>${escapeHtml(d.title)}</strong><div class="meta">${d.chunks.length} chunks</div></div>`
  )
  .join("");

function addBubble(html, user) {
  const el = document.createElement("div");
  el.className = "bubble" + (user ? " user" : "");
  el.innerHTML = html;
  document.getElementById("chat").appendChild(el);
}

document.getElementById("ask").addEventListener("click", () => {
  const q = document.getElementById("q").value.trim();
  if (!q) return;
  addBubble(escapeHtml(q), true);
  const hits = retrieve(q);
  const ans = answer(q, hits);
  const sources =
    hits.length > 0
      ? `<div class="sources"><strong>Sources</strong><br/>${hits
          .map((h) => `• ${escapeHtml(h.doc)}: “${escapeHtml(h.text)}”`)
          .join("<br/>")}</div>`
      : "";
  addBubble(escapeHtml(ans) + sources, false);
  document.getElementById("q").value = "";
});

document.getElementById("q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("ask").click();
});
