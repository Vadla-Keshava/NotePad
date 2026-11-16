const STORAGE_KEY = "notepad-notes-v1";
const notesGrid = document.getElementById("notesGrid");
const emptyState = document.getElementById("emptyState");
const noteDialog = document.getElementById("noteDialog");
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const searchInput = document.getElementById("searchInput");
const noteCount = document.getElementById("noteCount");
const pageTitle = document.getElementById("pageTitle");

let notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let editingId = null;
let showPinnedOnly = false;

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function renderNotes() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm) ||
      note.body.toLowerCase().includes(searchTerm);
    return matchesSearch && (!showPinnedOnly || note.pinned);
  });

  notesGrid.innerHTML = "";
  noteCount.textContent = `${visibleNotes.length} ${visibleNotes.length === 1 ? "note" : "notes"}`;
  emptyState.classList.toggle("show", visibleNotes.length === 0);

  visibleNotes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = `${note.pinned ? "★ " : ""}${note.title}`;
    const body = document.createElement("p");
    body.textContent = note.body || "No additional text";
    const footer = document.createElement("div");
    footer.className = "note-footer";
    const date = document.createElement("span");
    date.className = "note-date";
    date.textContent = formatDate(note.updatedAt);

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
      createActionButton(note.pinned ? "★" : "☆", "Pin note", () => togglePin(note.id)),
      createActionButton("✎", "Edit note", () => openEditor(note.id)),
      createActionButton("⌫", "Delete note", () => deleteNote(note.id))
    );
    footer.append(date, actions);
    card.append(title, body, footer);
    notesGrid.append(card);
  });
}

function createActionButton(symbol, label, action) {
  const button = document.createElement("button");
  button.className = "icon-btn";
  button.type = "button";
  button.textContent = symbol;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.addEventListener("click", action);
  return button;
}

function openEditor(id = null) {
  editingId = id;
  const note = notes.find(item => item.id === id);
  document.getElementById("dialogTitle").textContent = note ? "Edit note" : "Create a note";
  noteTitle.value = note ? note.title : "";
  noteBody.value = note ? note.body : "";
  noteDialog.showModal();
  noteTitle.focus();
}

function closeEditor() {
  noteDialog.close();
  noteForm.reset();
  editingId = null;
}

function deleteNote(id) {
  if (!confirm("Are you sure you want to delete this note?")) return;
  notes = notes.filter(note => note.id !== id);
  saveNotes();
  renderNotes();
}

function togglePin(id) {
  notes = notes.map(note => note.id === id ? { ...note, pinned: !note.pinned } : note);
  saveNotes();
  renderNotes();
}

noteForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = noteTitle.value.trim();
  const body = noteBody.value.trim();
  if (!title) return;

  if (editingId) {
    notes = notes.map(note => note.id === editingId
      ? { ...note, title, body, updatedAt: new Date().toISOString() }
      : note);
  } else {
    notes.unshift({
      id: crypto.randomUUID(),
      title,
      body,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  saveNotes();
  closeEditor();
  renderNotes();
});

document.getElementById("newNoteBtn").addEventListener("click", () => openEditor());
document.getElementById("emptyNewBtn").addEventListener("click", () => openEditor());
document.getElementById("closeDialog").addEventListener("click", closeEditor);
document.getElementById("cancelBtn").addEventListener("click", closeEditor);
searchInput.addEventListener("input", renderNotes);

document.getElementById("allNotesBtn").addEventListener("click", () => {
  showPinnedOnly = false;
  pageTitle.textContent = "All Notes";
  document.getElementById("allNotesBtn").classList.add("active");
  document.getElementById("pinnedBtn").classList.remove("active");
  renderNotes();
});

document.getElementById("pinnedBtn").addEventListener("click", () => {
  showPinnedOnly = true;
  pageTitle.textContent = "Pinned Notes";
  document.getElementById("pinnedBtn").classList.add("active");
  document.getElementById("allNotesBtn").classList.remove("active");
  renderNotes();
});

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("notepad-dark-mode", document.body.classList.contains("dark"));
});

if (localStorage.getItem("notepad-dark-mode") === "true") {
  document.body.classList.add("dark");
}

renderNotes();
