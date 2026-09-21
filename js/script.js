/**
 * Claude was used to help write, review, and refine the code.
 */

// Immediately Invoked Function Expression
// It runs immediately and keeps all variables/classes inside a local scope so they don't pollute the global window object.
(function () {
  const STORAGE_KEY = "notes";
  const INTERVAL = 2000; // 2 seconds interval for saving/reading
  const INDEX_PAGE = "index.html";

  //  Returns the current time formatted as "hh:mm:ssAM/PM" without spaces.
  function currentTime() {
    return new Date().toLocaleTimeString("en-US").replace(" ", "");
  }

  // Retrieves the saved notes string from localStorage and parses it back into a JavaScript array.
  // If nothing is saved, it returns an empty array.
  function readNotes() {
    const text = localStorage.getItem(STORAGE_KEY); 
    return text ? JSON.parse(text) : []; // localStorage can only store Strings. must parse the string back into a real JavaScript array.
  }



  // A helper class to dynamically create an HTML button element with a specific label, class, and click event.
  class Button {
    constructor(label, className, onClick) {
      this.element = document.createElement("button");
      this.element.textContent = label;
      this.element.className = className;
      this.element.addEventListener("click", onClick);
    }
  }



  // Represents a single note. It creates a textarea for typing and a button for deleting the note.
  class Note {
    constructor(text, onChange, onRemove) {
      this.onRemove = onRemove;

      // Create the textarea and listen for any typing ('input' event).
      this.textArea = document.createElement("textarea");
      this.textArea.className = "note";
      this.textArea.value = text;
      this.textArea.addEventListener("input", onChange);

      // Create a remove button that calls this.remove() when clicked.
      this.removeButton = new Button(MESSAGES.remove, "button remove-button", () => this.remove());

      // Group the textarea and button together inside a container div.
      this.row = document.createElement("div");
      this.row.className = "note-row";
      this.row.appendChild(this.textArea);
      this.row.appendChild(this.removeButton.element);
    }

    // Converts the current note's text into a plain object to easily save it as JSON.
    toObject() {
      return { text: this.textArea.value };
    }

    // Removes the note's HTML from the screen and calls the parent's onRemove callback.
    remove() {
      this.row.remove();
      this.onRemove(this);
    }
  }



  // Manages the 'writer' page where users can add, edit, and delete notes.
  class Writer {
    constructor() {
      this.notes = []; // Array holding all Note objects
      this.changed = false; // Tracks if there are unsaved changes
      
      // DOM references
      this.notesArea = document.getElementById("notes");
      this.timeArea = document.getElementById("time");

      // Create the "Add Note" button and append it to the page.
      const addButton = new Button(MESSAGES.add, "button add-button", () => {
        this.createNote("");
        this.changed = true; // Mark as changed so it saves later
      });
      document.getElementById("add-area").appendChild(addButton.element);

      // Load existing notes from localStorage and render them.
      readNotes().forEach((note) => this.createNote(note.text));
      
      // Save immediately on load, then set a timer to save every 2 seconds if there are changes.
      this.save();
      setInterval(() => this.saveIfChanged(), INTERVAL);
    }

    // Creates a new Note object and displays it on the screen.
    createNote(text) {
      const note = new Note(
        text,
        () => { this.changed = true; }, // on input change
        (removed) => this.deleteNote(removed) // on remove button click
      );
      this.notes.push(note);
      this.notesArea.appendChild(note.row);
    }

    // Removes the specific note from the array and saves the updated list.
    deleteNote(note) {
      // indexOf() finds the exact position of this note in the array.
      // splice(index, 1) removes exactly 1 element at that position.
      this.notes.splice(this.notes.indexOf(note), 1);
      this.save();
    }

    // Checks if 'changed' is true before forcing a save.
    saveIfChanged() {
      if (this.changed) {
        this.save();
      }
    }

    // Converts all Note objects to plain text objects, converts to JSON string, and saves to localStorage.
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes.map((note) => note.toObject())));
      this.changed = false;
      this.timeArea.textContent = MESSAGES.storedAt + currentTime();
    }
  }



  // Manages the 'reader' page which only displays the notes without editing capabilities.
  class Reader {
    constructor() {
      this.notesArea = document.getElementById("notes");
      this.timeArea = document.getElementById("time");

      // Show notes immediately, update every 2 seconds, and listen for cross-tab updates ('storage' event).
      this.show();
      // Polling: setInterval re-reads data every 2 seconds.
      // Event: 'storage' event fires automatically when localStorage changes in another tab.
      setInterval(() => this.show(), INTERVAL);
      window.addEventListener("storage", () => this.show());
    }

    // Clears the display and repopulates it with the latest notes from localStorage.
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


  // Check which HTML page is currently open by looking for specific elements.
  // It checks for the existence of specific HTML elements.
  if (document.getElementById("lab-title")) {
    // If "lab-title" exists, we are on the Index (Main) page. Set up the localized text.
    document.getElementById("lab-title").textContent = MESSAGES.labTitle;
    document.getElementById("student-name").textContent = MESSAGES.studentName;
    document.getElementById("writer-link").textContent = MESSAGES.writer;
    document.getElementById("reader-link").textContent = MESSAGES.reader;
  }
  else {
    // If not on the main page, create a "Back to Index" button.
    const backButton = new Button(MESSAGES.back, "button back-button", () => {
      window.location.href = INDEX_PAGE;
    });
    document.getElementById("back-area").appendChild(backButton.element);

    // Determine if this is the Writer page or the Reader page based on the existence of "add-area".
    if (document.getElementById("add-area")) {
      new Writer(); // Start writer logic
    } else {
      new Reader(); // Start reader logic
    }
  }
})();
