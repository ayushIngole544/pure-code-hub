import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@/services/workspace";

import {
  Plus,
  FileText,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface WorkspaceNote {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export default function TeacherWorkspace() {
  const { user } = useAuth();

  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [selectedNote, setSelectedNote] =
    useState<WorkspaceNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH NOTES
  const fetchNotes = useCallback(async () => {
    if (!user) return;

    try {
      const res = await getNotes();
      setNotes(res.notes || []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // 🔥 CREATE NOTE
  const handleCreate = async () => {
    try {
      const res = await createNote();

      const note = res.note;

      setNotes([note, ...notes]);
      setSelectedNote(note);
      setEditTitle(note.title);
      setEditContent(note.content || "");
      setIsEditing(true);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 DELETE NOTE
  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);

      setNotes(notes.filter((n) => n.id !== noteId));

      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 SAVE EDIT
  const handleSave = async () => {
    if (!selectedNote) return;

    try {
      await updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
      });

      const updated = notes.map((n) =>
        n.id === selectedNote.id
          ? {
              ...n,
              title: editTitle,
              content: editContent,
              updated_at: new Date().toISOString(),
            }
          : n
      );

      setNotes(updated);
      setSelectedNote({
        ...selectedNote,
        title: editTitle,
        content: editContent,
      });

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);

    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content || "");
    }
  };

  if (loading)
    return (
      <div className="page-container flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-0">
            Private Workspace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personal space for notes and drafts
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div>
          <div className="card-elevated p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2>My Notes ({notes.length})</h2>
            </div>

            {notes.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">

                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                    className={`p-4 cursor-pointer ${
                      selectedNote?.id === note.id
                        ? "bg-secondary"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between">
                      <h3>{note.title}</h3>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div className="p-6 text-center">
                No notes yet
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2">

          {selectedNote ? (
            <div className="card-elevated">

              <div className="flex justify-between mb-4">

                {isEditing ? (
                  <input
                    value={editTitle}
                    onChange={(e) =>
                      setEditTitle(e.target.value)
                    }
                    className="input-field"
                  />
                ) : (
                  <h2>{selectedNote.title}</h2>
                )}

                <div className="flex gap-2">

                  {isEditing ? (
                    <>
                      <button onClick={handleSave}>
                        <Save />
                      </button>

                      <button onClick={cancelEdit}>
                        <X />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditTitle(selectedNote.title);
                        setEditContent(
                          selectedNote.content || ""
                        );
                        setIsEditing(true);
                      }}
                    >
                      <Edit2 />
                    </button>
                  )}

                </div>

              </div>

              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) =>
                    setEditContent(e.target.value)
                  }
                  className="input-field min-h-[300px]"
                />
              ) : (
                <pre>{selectedNote.content}</pre>
              )}

            </div>
          ) : (
            <div className="card-elevated text-center p-10">
              Select a note
            </div>
          )}

        </div>
      </div>
    </div>
  );
}