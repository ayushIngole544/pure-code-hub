import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Send, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CodeEditorProps {
  initialCode?: string;
  language: string;
  onSubmit: (code: string) => void;
  onRun?: (code: string) => void;
  readOnly?: boolean;
  submitting?: boolean;
}

export function CodeEditor({ initialCode = '', language, onSubmit, onRun, readOnly = false, submitting = false }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save to localStorage every 3 seconds of inactivity
  useEffect(() => {
    if (readOnly) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      const key = `codehub_draft_${language}_${initialCode.slice(0, 20)}`;
      localStorage.setItem(key, code);
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1500);
    }, 3000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [code, language, initialCode, readOnly]);

  // Restore draft on mount
  useEffect(() => {
    const key = `codehub_draft_${language}_${initialCode.slice(0, 20)}`;
    const saved = localStorage.getItem(key);
    if (saved && saved !== initialCode) {
      setCode(saved);
    }
  }, []);

  const handleRun = async () => {
    setRunning(true);
    setOutput('Running code...\n');

    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code, language },
      });

      if (error) throw error;

      if (data?.stderr) {
        setOutput(`Error:\n${data.stderr}\n\nExecution time: ${data.executionTime}ms`);
      } else {
        setOutput(`${data?.output || 'No output'}\n\nExecution time: ${data?.executionTime || 0}ms`);
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message || 'Failed to execute code'}`);
    }

    setRunning(false);
    onRun?.(code);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    const key = `codehub_draft_${language}_${initialCode.slice(0, 20)}`;
    localStorage.removeItem(key);
  };

  const handleSubmit = () => {
    onSubmit(code);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setCode(code.substring(0, start) + '  ' + code.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // Manual save
      const key = `codehub_draft_${language}_${initialCode.slice(0, 20)}`;
      localStorage.setItem(key, code);
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1500);
    }
  };

  const getLanguageColor = () => {
    const colors: Record<string, string> = {
      javascript: 'bg-warning-light text-warning',
      python: 'bg-info-light text-primary',
      java: 'bg-warning-light text-warning',
      cpp: 'bg-secondary text-foreground',
      'c++': 'bg-secondary text-foreground',
      c: 'bg-secondary text-foreground',
      go: 'bg-info-light text-primary',
      rust: 'bg-error-light text-error',
      typescript: 'bg-info-light text-primary',
    };
    return colors[language.toLowerCase()] || 'bg-secondary text-secondary-foreground';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 rounded-t-lg border border-border">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${getLanguageColor()}`}>{language}</span>
          {autoSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 animate-in fade-in">
              <Save className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Reset code (Ctrl+Shift+R)">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={handleRun} disabled={running} className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running...' : 'Run'}
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg transition-colors text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 border-x border-border">
        <div className="flex-1 relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-code border-r border-code-border flex flex-col items-end py-4 pr-2 text-xs text-muted-foreground font-mono select-none">
            {code.split('\n').map((_, i) => (<div key={i} className="leading-6">{i + 1}</div>))}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full min-h-[300px] pl-14 pr-4 py-4 bg-code font-mono text-sm text-foreground resize-none focus:outline-none leading-6"
            spellCheck={false}
            readOnly={readOnly}
            placeholder="Write your code here..."
          />
        </div>

        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border">
          <div className="bg-secondary/50 px-4 py-2 border-b border-border">
            <span className="text-sm font-medium text-foreground">Output</span>
          </div>
          <div className="p-4 bg-code min-h-[150px] font-mono text-sm text-muted-foreground whitespace-pre-wrap">
            {output || 'Run your code to see output here...'}
          </div>
        </div>
      </div>

      <div className="bg-secondary/50 px-4 py-2 rounded-b-lg border border-t-0 border-border text-xs text-muted-foreground flex items-center justify-between">
        <span>Ctrl+Enter to run • Ctrl+S to save • Tab for indentation</span>
        <span>{code.split('\n').length} lines</span>
      </div>
    </div>
  );
}
