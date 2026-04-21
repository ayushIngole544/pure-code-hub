import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText, Upload } from "lucide-react";

export default function NotesManager() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {}
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      await fetch("http://localhost:5000/api/notes/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      fetchNotes();
      setTitle("");
      setContent("");
      setFile(null);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h1 className="section-title mb-6 flex items-center gap-2">
        <FileText className="w-8 h-8 text-primary" /> Manage Notes
      </h1>

      <div className="card-elevated mb-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Create New Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" placeholder="Note Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="input-field py-3 min-h-[100px]" placeholder="Content..." value={content} onChange={(e) => setContent(e.target.value)} required />
          <div className="flex items-center gap-4">
            <label className="btn-secondary flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> {file ? file.name : "Upload File"}
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            <button className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Publish Note"}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="card-elevated border-l-4 border-l-primary">
            <h3 className="font-bold text-lg">{note.title}</h3>
            <p className="text-muted-foreground mt-2 line-clamp-3">{note.content}</p>
            {note.fileUrl && (
              <a href={`http://localhost:5000${note.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium flex gap-1 items-center mt-4 pt-4 border-t border-border">
                <FileText className="w-4 h-4" /> Download Attached File
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
