import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/SocketContext";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const socket = useContext(SocketContext);
  const token = localStorage.getItem("token");

  // ✅ Fetch notes on load
  useEffect(() => {
    fetch("/api/notes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.notes) {
          setNotes(data.notes);
        }
      });

    // ✅ Real-time listeners
    socket.on("note:created", (note) => {
      setNotes((prev) => [...prev, note]);
    });

    socket.on("note:updated", (updatedNote) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === updatedNote._id ? updatedNote : note
        )
      );
    });

    socket.on("note:deleted", ({ noteId }) => {
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
    });

    return () => {
      socket.off("note:created");
      socket.off("note:updated");
      socket.off("note:deleted");
    };
  }, [token, socket]);

  // ✅ Create note
  const handleCreateNote = (e) => {
    e.preventDefault();

    fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newNote }),
    })
      .then((res) => res.json())
      .then((data) => {
        setNewNote(data);
      });
  };

  // ✅ Update note
  const handleUpdateNote = (id, currentContent) => {
    const updatedContent = prompt("Edit note:", currentContent);
    if (!updatedContent || updatedContent === currentContent) return;

    fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: updatedContent }),
    });
  };

  // ✅ Delete note
  const handleDeleteNote = (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📝 Your Notes</h2>

      <form onSubmit={handleCreateNote}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter a new note"
          required
        />
        <button type="submit">Add Note</button>
      </form>

      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            {note.content}{" "}
            <button onClick={() => handleUpdateNote(note._id, note.content)}>
              ✏️ Edit
            </button>{" "}
            <button onClick={() => handleDeleteNote(note._id)}>
              🗑️ Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
