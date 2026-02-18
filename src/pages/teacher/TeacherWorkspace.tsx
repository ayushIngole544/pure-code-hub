import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';

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
  const [selectedNote, setSelectedNote] = useState<WorkspaceNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('teacher_notes')
      .select('*')
      .eq('teacher_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) setNotes(data as unknown as WorkspaceNote[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const createNote = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('teacher_notes')
      .insert({ teacher_id: user.id, title: 'Untitled Note', content: '' })
      .select()
      .single();

    if (data) {
      const note = data as unknown as WorkspaceNote;
      setNotes([note, ...notes]);
      setSelectedNote(note);
      setEditTitle(note.title);
      setEditContent(note.content || '');
      setIsEditing(true);
    }
  };

  const deleteNote = async (noteId: string) => {
    await supabase.from('teacher_notes').delete().eq('id', noteId);
    setNotes(notes.filter(n => n.id !== noteId));
    if (selectedNote?.id === noteId) { setSelectedNote(null); setIsEditing(false); }
  };

  const saveEdit = async () => {
    if (!selectedNote) return;
    await supabase.from('teacher_notes').update({ title: editTitle, content: editContent }).eq('id', selectedNote.id);
    const updated = notes.map(n => n.id === selectedNote.id ? { ...n, title: editTitle, content: editContent, updated_at: new Date().toISOString() } : n);
    setNotes(updated);
    setSelectedNote({ ...selectedNote, title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (selectedNote) { setEditTitle(selectedNote.title); setEditContent(selectedNote.content || ''); }
  };

  if (loading) return <div className="page-container flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-0">Private Workspace</h1>
          <p className="text-muted-foreground text-sm mt-1">Your personal space for notes and question drafts</p>
        </div>
        <button onClick={createNote} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Note</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card-elevated p-0 overflow-hidden">
            <div className="p-4 border-b border-border"><h2 className="font-semibold text-foreground">My Notes ({notes.length})</h2></div>
            {notes.length > 0 ? (
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className={`p-4 cursor-pointer hover:bg-secondary/50 transition-colors ${selectedNote?.id === note.id ? 'bg-secondary' : ''}`} onClick={() => { setSelectedNote(note); setIsEditing(false); }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /><h3 className="font-medium text-foreground text-sm truncate">{note.title}</h3></div>
                      <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-muted-foreground hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(note.updated_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No notes yet</p></div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedNote ? (
            <div className="card-elevated">
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field text-lg font-semibold" placeholder="Note title" />
                ) : (
                  <h2 className="text-lg font-semibold text-foreground">{selectedNote.title}</h2>
                )}
                <div className="flex gap-2">
                  {isEditing ? (
                    <><button onClick={saveEdit} className="btn-primary flex items-center gap-1"><Save className="w-4 h-4" />Save</button><button onClick={cancelEdit} className="btn-outline flex items-center gap-1"><X className="w-4 h-4" />Cancel</button></>
                  ) : (
                    <button onClick={() => { setEditTitle(selectedNote.title); setEditContent(selectedNote.content || ''); setIsEditing(true); }} className="btn-secondary flex items-center gap-1"><Edit2 className="w-4 h-4" />Edit</button>
                  )}
                </div>
              </div>
              {isEditing ? (
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="input-field min-h-[400px] resize-none font-mono text-sm" placeholder="Write your notes here..." />
              ) : (
                <div className="min-h-[400px] p-4 bg-secondary/30 rounded-lg">
                  {selectedNote.content ? (<pre className="whitespace-pre-wrap font-mono text-sm text-foreground">{selectedNote.content}</pre>) : (<p className="text-muted-foreground italic">No content. Click Edit to add content.</p>)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">Last updated: {new Date(selectedNote.updated_at).toLocaleString()}</p>
            </div>
          ) : (
            <div className="card-elevated h-full flex items-center justify-center py-20">
              <div className="text-center"><FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" /><p className="text-muted-foreground">Select a note to view or edit</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
