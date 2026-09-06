import React, { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '../../store/projectStore';
import { generateCode } from '../../services/codeGenerator';
import { parseHtmlToComponentTree } from '../../services/parser';
import { FileCode, Play, AlertTriangle } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const { project, activePageId, updateComponent } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlDraft, setHtmlDraft] = useState<{ pageId: string; value: string } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const compiledCode = useMemo(() => generateCode(project), [project]);
  const generatedHtml = useMemo(() => {
    const fullHtml = compiledCode.htmlPages[activePageId] || '';
    const bodyMatch = fullHtml.match(/<body>([\s\S]*?)<\/body>/);
    return bodyMatch ? bodyMatch[1].trim() : fullHtml;
  }, [activePageId, compiledCode]);

  const htmlCode = htmlDraft?.pageId === activePageId ? htmlDraft.value : generatedHtml;
  const cssCode = compiledCode.cssCode;
  const jsCode = compiledCode.jsCode;

  // Debounced synchronizer for HTML edits
  const handleHtmlChange = (value: string | undefined) => {
    if (!value) return;
    setHtmlDraft({ pageId: activePageId, value });

    // Try parsing
    try {
      // Parse the snippet inside a wrapper body to secure parse tree root
      const parsedTree = parseHtmlToComponentTree(`<div>${value}</div>`);
      
      // The wrapper root component has parsed children, so we extract its children and update page
      const pageRootNode = parsedTree; // root component node
      
      // Update page root component in project store (without committing history on every keystroke)
      // To prevent lagging, we can update it directly.
      updateComponent('root', {
        children: pageRootNode.children,
        styles: pageRootNode.styles,
        attributes: pageRootNode.attributes,
        classes: pageRootNode.classes
      });
      setSyncError(null);
    } catch (err: any) {
      setSyncError(err.message || 'HTML Syntax Error');
    }
  };

  const getLanguage = () => {
    if (activeTab === 'html') return 'html';
    if (activeTab === 'css') return 'css';
    return 'javascript';
  };

  const getCodeValue = () => {
    if (activeTab === 'html') return htmlCode;
    if (activeTab === 'css') return cssCode;
    return jsCode;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-350 select-none">
      
      {/* Editor Tabs & Toolbar */}
      <div className="flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-1">
          <FileCode className="w-4 h-4 text-sky-400 mr-2" />
          {(['html', 'css', 'js'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold uppercase text-xs tracking-wider border-b-2 transition ${activeTab === tab ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center text-[10px] text-slate-500 font-mono">
          <span>{activeTab === 'html' ? `${activePageId}.html (Editable Body)` : activeTab === 'css' ? 'style.css (Read-only)' : 'script.js (Read-only)'}</span>
        </div>
      </div>

      {/* Sync Error Banner */}
      {activeTab === 'html' && syncError && (
        <div className="bg-rose-950/70 border-b border-rose-800 text-rose-350 px-4 py-2 text-[10px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span><strong>Parser Blocked:</strong> {syncError} (Canvas rendering paused until error fixed)</span>
        </div>
      )}

      {/* Monaco Code Viewport */}
      <div className="flex-1 min-h-0 bg-slate-950">
        <Editor
          height="100%"
          language={getLanguage()}
          theme="vs-dark"
          value={getCodeValue()}
          onChange={(val) => activeTab === 'html' && handleHtmlChange(val)}
          options={{
            readOnly: activeTab !== 'html', // Only HTML editing compiles back recursively for now
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: 'Fira Code, Consolas, Monaco, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            automaticLayout: true,
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900 px-4 py-1.5 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
        <span>VividCode Engine v1.0.0</span>
        {activeTab === 'html' ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Play className="w-3 h-3" /> Two-Way Sync Active
          </span>
        ) : (
          <span>Generated Sheet</span>
        )}
      </div>

    </div>
  );
};
