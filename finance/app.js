const KEY = "finance-demo-v1";

const defaultState = () => ({
  accounts: [
    { id: "a1", name: "Checking", balance: 1250.4 },
    { id: "a2", name: "Savings", balance: 3200 },
  ],
  txs: [
    { id: "x1", accountId: "a1", type: "income", amount: 2000, note: "Salary", at: Date.now() - 86400000 * 3 },
    { id: "x2", accountId: "a1", type: "expense", amount: 48.2, note: "Groceries", at: Date.now() - 86400000 },
  ],
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch {
    return defaultState();
  }
}

function save(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

let state = load();

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function money(n) {
  return Number(n).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function render() {
  const start = monthStart();
  const income = state.txs.filter((t) => t.type === "income" && t.at >= start).reduce((s, t) => s + t.amount, 0);
  const expense = state.txs.filter((t) => t.type === "expense" && t.at >= start).reduce((s, t) => s + t.amount, 0);
  const total = state.accounts.reduce((s, a) => s + a.balance, 0);

  document.getElementById("stats").innerHTML = `
    <div class="stat"><div class="label">Total balance</div><div class="value">${money(total)}</div></div>
    <div class="stat"><div class="label">Income (this month)</div><div class="value">${money(income)}</div></div>
    <div class="stat"><div class="label">Expenses (this month)</div><div class="value">${money(expense)}</div></div>
  `;

  document.getElementById("accounts").innerHTML = state.accounts
    .map(
      (a) =>
        `<div class="item"><strong>${escapeHtml(a.name)}</strong><div class="meta">${money(a.balance)}</div></div>`
    )
    .join("");

  document.getElementById("acct").innerHTML = state.accounts
    .map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`)
    .join("");

  const list = [...state.txs].sort((a, b) => b.at - a.at).slice(0, 12);
  document.getElementById("txList").innerHTML = list
    .map((t) => {
      const acct = state.accounts.find((a) => a.id === t.accountId);
      const sign = t.type === "income" ? "+" : "-";
      return `<div class="item">
        <div><strong>${sign}${money(t.amount)}</strong> · ${escapeHtml(t.note || t.type)}</div>
        <div class="meta">${escapeHtml(acct ? acct.name : "?")} · ${new Date(t.at).toLocaleDateString()}</div>
      </div>`;
    })
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

document.getElementById("addTx").addEventListener("click", () => {
  const amount = parseFloat(document.getElementById("amount").value);
  if (!amount || amount <= 0) return;
  const accountId = document.getElementById("acct").value;
  const type = document.getElementById("type").value;
  const note = document.getElementById("note").value.trim() || type;
  const acct = state.accounts.find((a) => a.id === accountId);
  if (!acct) return;

  if (type === "income") acct.balance += amount;
  else acct.balance -= amount;

  state.txs.push({ id: uid(), accountId, type, amount, note, at: Date.now() });
  document.getElementById("amount").value = "";
  document.getElementById("note").value = "";
  save(state);
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  state = defaultState();
  save(state);
  render();
});

render();
