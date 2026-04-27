import { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { api } from "@/services/api";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000";

export default function StudentNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await api.get("/notes");
        setNotes(res.data.notes || []);
      } catch (err) {
        console.error("Failed to fetch notes", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6 flex items-center gap-2">
        <FileText className="w-8 h-8 text-primary" /> Study Notes
      </h1>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="card-elevated border-l-4 border-l-secondary relative">
              <h3 className="font-bold text-lg">{note.title}</h3>
              <p className="text-muted-foreground mt-2">{note.content}</p>
              {note.fileUrl && (
                <a href={`${API_BASE}${note.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center flex gap-2 items-center mt-6">
                  <Download className="w-4 h-4" /> Download Attached File
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-elevated text-center py-12">
          <p className="text-muted-foreground">No notes available at the moment.</p>
        </div>
      )}
    </div>
  );
}
