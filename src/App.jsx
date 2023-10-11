import { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes");
      const notes = await res.json();
      setNotes(notes);
    } catch (err) {
      console.error(err);
    }
  };

  const resetInputFields = () => {
    setTitle("");
    setContent("");
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });
      const newNote = await res.json();
      setNotes([newNote, ...notes]);
      resetInputFields();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNote = (e) => {
    e.preventDefault();

    if (!selectedNote) return;

    const updatedNote = {
      id: selectedNote.id,
      title,
      content,
    };

    const backupNotes = notes;
    // Optimistic update: Immediately update the UI with the new note data
    const noteIndex = notes.findIndex((note) => note.id === updatedNote.id);

    if (noteIndex !== -1) {
      // Create a new array with the updated note
      const updatedNotesList = [...notes];
      updatedNotesList[noteIndex] = updatedNote;
      setNotes(updatedNotesList);
      handleCancel();
    }
    // Send the PUT request to the backend
    fetch(`http://localhost:5000/api/notes/${updatedNote.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedNote),
    })
      .then((res) => {
        if (!res.ok) {
          // If the backend update request fails, revert the UI change
          setNotes(backupNotes); // Revert to the previous state
        }
      })
      .catch((err) => {
        console.error(err);
        // If there's a network error, also revert the UI change
        setNotes(backupNotes); // Revert to the previous state
      });
  };

  const handleCancel = () => {
    resetInputFields();
    setSelectedNote(null);
  };

  const handleDeleteNote = (e, noteId) => {
    e.stopPropagation();
    const backupNotes = notes;

    // Make an optimistic update by immediately removing the note from the UI
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);

    // Send the DELETE request to the backend
    fetch(`http://localhost:5000/api/notes/${noteId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          // If the backend delete request fails, revert the UI change
          setNotes(backupNotes); // Revert to the original notes state
        }
      })
      .catch((err) => {
        console.error(err);
        // If there's a network error, also revert the UI change
        setNotes(backupNotes); // Revert to the original notes state
      });
  };

  return (
    <div className="app-container">
      <form
        className="note-form"
        onSubmit={(e) =>
          selectedNote ? handleUpdateNote(e) : handleAddNote(e)
        }
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          name="content"
          placeholder="Content"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>

        {selectedNote ? (
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button type="submit">Add Note</button>
        )}
      </form>

      <div className="notes-grid">
        {notes.map((note) => (
          <div
            className="note-item"
            key={note.id}
            onClick={() => handleNoteClick(note)}
          >
            <div className="notes-header">
              <button onClick={(e) => handleDeleteNote(e, note.id)}>x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
