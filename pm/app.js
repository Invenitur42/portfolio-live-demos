const KEY = "pm-demo-v1";

const defaultState = () => ({
  projects: [
    {
      id: "p1",
      name: "Launch checklist",
      tasks: [
        { id: "t1", title: "Draft README", col: "done" },
        { id: "t2", title: "Wire auth", col: "doing" },
        { id: "t3", title: "Deploy preview", col: "todo" },
      ],
    },
  ],
  activeId: "p1",
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch {
    return defaultState();
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

let state = load();

const cols = [
  { id: "todo", label: "To Do" },
  { id: "doing", label: "In Progress" },
  { id: "done", label: "Done" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function activeProject() {
  return state.projects.find((p) => p.id === state.activeId) || state.projects[0];
}

function renderSelect() {
  const sel = document.getElementById("projSelect");
  sel.innerHTML = state.projects
    .map(
      (p) =>
        `<option value="${p.id}" ${p.id === state.activeId ? "selected" : ""}>${escapeHtml(
          p.name
        )}</option>`
    )
    .join("");
}

function renderBoard() {
  const proj = activeProject();
  if (!proj) {
    document.getElementById("board").innerHTML = "<p>No projects yet.</p>";
    return;
  }
  document.getElementById("board").innerHTML = cols
    .map((c) => {
      const tasks = proj.tasks.filter((t) => t.col === c.id);
      const items = tasks
        .map(
          (t) => `
        <div class="task">
          <div>${escapeHtml(t.title)}</div>
          <div class="meta">
            ${cols
              .filter((x) => x.id !== t.col)
              .map(
                (x) =>
                  `<button type="button" class="secondary" data-move="${t.id}" data-col="${x.id}" style="margin:4px 4px 0 0;padding:2px 8px;font-size:12px">→ ${x.label}</button>`
              )
              .join("")}
            <button type="button" class="danger" data-del="${t.id}" style="margin:4px 0 0;padding:2px 8px;font-size:12px">Delete</button>
          </div>
        </div>`
        )
        .join("");
      return `<div class="col"><h3>${c.label} (${tasks.length})</h3>${items || "<p class=\"meta\">Empty</p>"}</div>`;
    })
    .join("");

  document.querySelectorAll("[data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = proj.tasks.find((x) => x.id === btn.getAttribute("data-move"));
      if (t) t.col = btn.getAttribute("data-col");
      save(state);
      renderBoard();
    });
  });
  document.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      proj.tasks = proj.tasks.filter((x) => x.id !== btn.getAttribute("data-del"));
      save(state);
      renderBoard();
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """);
}

function render() {
  renderSelect();
  renderBoard();
}

document.getElementById("projSelect").addEventListener("change", (e) => {
  state.activeId = e.target.value;
  save(state);
  renderBoard();
});

document.getElementById("addProj").addEventListener("click", () => {
  const name = document.getElementById("projName").value.trim();
  if (!name) return;
  const id = uid();
  state.projects.push({ id, name, tasks: [] });
  state.activeId = id;
  document.getElementById("projName").value = "";
  save(state);
  render();
});

document.getElementById("addTask").addEventListener("click", () => {
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return;
  const proj = activeProject();
  if (!proj) return;
  proj.tasks.push({
    id: uid(),
    title,
    col: document.getElementById("taskCol").value,
  });
  document.getElementById("taskTitle").value = "";
  save(state);
  renderBoard();
});

document.getElementById("reset").addEventListener("click", () => {
  state = defaultState();
  save(state);
  render();
});

render();
