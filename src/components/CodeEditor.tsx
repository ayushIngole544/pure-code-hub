import { useState } from 'react';
import { Play, RotateCcw, Send } from 'lucide-react';

interface CodeEditorProps {
  initialCode?: string;
  language: string;
  onSubmit: (code: string) => void;
  onRun?: (code: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ initialCode = '', language, onSubmit, onRun, readOnly = false }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');

  const handleRun = () => {
    // Simulated code execution
    setOutput('Running code...\n\n> Code executed successfully!\n> Output: Hello World');
    onRun?.(code);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
  };

  const handleSubmit = () => {
    onSubmit(code);
  };

  const getLanguageColor = () => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800',
      python: 'bg-blue-100 text-blue-800',
      java: 'bg-orange-100 text-orange-800',
      cpp: 'bg-purple-100 text-purple-800',
      c: 'bg-gray-100 text-gray-800',
    };
    return colors[language.toLowerCase()] || 'bg-secondary text-secondary-foreground';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 rounded-t-lg border border-border">
        <span className={`text-xs font-medium px-2 py-1 rounded ${getLanguageColor()}`}>
          {language}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg transition-colors text-sm font-medium hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 border-x border-border">
        <div className="flex-1 relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-code border-r border-code-border flex flex-col items-end py-4 pr-2 text-xs text-muted-foreground font-mono">
            {code.split('\n').map((_, i) => (
              <div key={i} className="leading-6">{i + 1}</div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full min-h-[300px] pl-14 pr-4 py-4 bg-code font-mono text-sm text-foreground resize-none focus:outline-none leading-6"
            spellCheck={false}
            readOnly={readOnly}
            placeholder="Write your code here..."
          />
        </div>

        {/* Output panel */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border">
          <div className="bg-secondary/50 px-4 py-2 border-b border-border">
            <span className="text-sm font-medium text-foreground">Output</span>
          </div>
          <div className="p-4 bg-code min-h-[150px] font-mono text-sm text-muted-foreground whitespace-pre-wrap">
            {output || 'Run your code to see output here...'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-secondary/50 px-4 py-2 rounded-b-lg border border-t-0 border-border text-xs text-muted-foreground">
        Press Ctrl+Enter to run • Tab for indentation
      </div>
    </div>
  );
}
