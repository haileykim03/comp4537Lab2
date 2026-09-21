/**
 * Claude was used to help write, review, and refine the code.
 */

(function () {
  const STORAGE_KEY = "notes";
  const INTERVAL = 2000;
  const INDEX_PAGE = "index.html";

  function currentTime() {
    return new Date().toLocaleTimeString("en-US").replace(" ", "");
  }

  function readNotes() {
    const text = localStorage.getItem(STORAGE_KEY);
    return text ? JSON.parse(text) : [];
  }

  class Button {
    constructor(label, className, onClick) {
      this.element = document.createElement("button");
      this.element.textContent = label;
      this.element.className = className;
      this.element.addEventListener("click", onClick);
    }
  }

  class Note {
    constructor(text, onChange, onRemove) {
      this.onRemove = onRemove;

      this.textArea = document.createElement("textarea");
      this.textArea.className = "note";
      this.textArea.value = text;
      this.textArea.addEventListener("input", onChange);

      this.removeButton = new Button(MESSAGES.remove, "button remove-button", () => this.remove());

      this.row = document.createElement("div");
      this.row.className = "note-row";
      this.row.appendChild(this.textArea);
      this.row.appendChild(this.removeButton.element);
    }

    toObject() {
      return { text: this.textArea.value };
    }

    remove() {
      this.row.remove();
      this.onRemove(this);
    }
  }

  class Writer {
    constructor() {
      this.notes = [];
      this.changed = false;
      this.notesArea = document.getElementById("notes");
      this.timeArea = document.getElementById("time");

      const addButton = new Button(MESSAGES.add, "button add-button", () => {
        this.createNote("");
        this.changed = true;
      });
      document.getElementById("add-area").appendChild(addButton.element);

      readNotes().forEach((note) => this.createNote(note.text));
      this.save();
      setInterval(() => this.saveIfChanged(), INTERVAL);
    }

    createNote(text) {
      const note = new Note(
        text,
        () => { this.changed = true; },
        (removed) => this.deleteNote(removed)
      );
      this.notes.push(note);
      this.notesArea.appendChild(note.row);
    }

    deleteNote(note) {
      this.notes.splice(this.notes.indexOf(note), 1);
      this.save();
    }

    saveIfChanged() {
      if (this.changed) {
        this.save();
      }
    }

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes.map((note) => note.toObject())));
      this.changed = false;
      this.timeArea.textContent = MESSAGES.storedAt + currentTime();
    }
  }

  class Reader {
    constructor() {
      this.notesArea = document.getElementById("notes");
      this.timeArea = document.getElementById("time");

      this.show();
      setInterval(() => this.show(), INTERVAL);
      window.addEventListener("storage", () => this.show());
    }

    show() {
      this.notesArea.innerHTML = "";
      readNotes().forEach((note) => {
        const box = document.createElement("div");
        box.className = "note";
        box.textContent = note.text;
        this.notesArea.appendChild(box);
      });
      this.timeArea.textContent = MESSAGES.updatedAt + currentTime();
    }
  }

  if (document.getElementById("lab-title")) {
    document.getElementById("lab-title").textContent = MESSAGES.labTitle;
    document.getElementById("student-name").textContent = MESSAGES.studentName;
    document.getElementById("writer-link").textContent = MESSAGES.writer;
    document.getElementById("reader-link").textContent = MESSAGES.reader;
  } else {
    const backButton = new Button(MESSAGES.back, "button back-button", () => {
      window.location.href = INDEX_PAGE;
    });
    document.getElementById("back-area").appendChild(backButton.element);

    if (document.getElementById("add-area")) {
      new Writer();
    } else {
      new Reader();
    }
  }
})();
