import React, { useEffect, useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, Link, Palette, Eraser, 
  List, ListOrdered 
} from 'lucide-react';

interface TextFormatterProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const TextFormatter: React.FC<TextFormatterProps> = ({ canvasRef }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPosition(null);
        setShowColorPicker(false);
        setShowBgColorPicker(false);
        return;
      }

      // Ensure selection is within the canvas
      const range = selection.getRangeAt(0);
      const canvas = canvasRef.current;
      if (!canvas || !canvas.contains(range.commonAncestorContainer)) {
        setPosition(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const parentRect = canvas.getBoundingClientRect();

      // Position toolbar above selection
      setPosition({
        top: rect.top - parentRect.top - 45 + canvas.scrollTop,
        left: rect.left - parentRect.left + (rect.width / 2) - 150, // Center the toolbar width (approx 300px)
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [canvasRef]);

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  const handleLinkPrompt = () => {
    const url = prompt('Enter the link URL:', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  if (!position) return null;

  return (
    <div 
      ref={toolbarRef}
      className="absolute bg-slate-950 border border-slate-800 rounded-lg p-1 flex items-center gap-1 shadow-2xl z-50 text-slate-300 animate-fade-in"
      style={{ 
        top: `${Math.max(10, position.top)}px`, 
        left: `${Math.max(10, position.left)}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={() => executeCommand('bold')}
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button 
        onClick={() => executeCommand('italic')}
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button 
        onClick={() => executeCommand('underline')}
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
        title="Underline"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-800 mx-1" />

      {/* Text Color */}
      <div className="relative">
        <button 
          onClick={() => { setShowColorPicker(!showColorPicker); setShowBgColorPicker(false); }}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition flex items-center gap-0.5"
          title="Text Color"
        >
          <Palette className="w-3.5 h-3.5 text-sky-400" />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded p-1.5 grid grid-cols-5 gap-1.5 shadow-xl z-50">
            {['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#64748b', '#000000'].map(color => (
              <button 
                key={color}
                onClick={() => { executeCommand('foreColor', color); setShowColorPicker(false); }}
                className="w-4 h-4 rounded-full border border-slate-700 hover:scale-110 transition"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Highlight Color */}
      <div className="relative">
        <button 
          onClick={() => { setShowBgColorPicker(!showBgColorPicker); setShowColorPicker(false); }}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
          title="Highlight Color"
        >
          <Palette className="w-3.5 h-3.5 text-yellow-400" />
        </button>
        {showBgColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded p-1.5 grid grid-cols-5 gap-1.5 shadow-xl z-50">
            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#e9d5ff', '#fed7aa', '#cbd5e1', '#ffffff', 'transparent'].map(color => (
              <button 
                key={color}
                onClick={() => { executeCommand(color === 'transparent' ? 'hiliteColor' : 'backColor', color); setShowBgColorPicker(false); }}
                className="w-4 h-4 rounded-sm border border-slate-700 hover:scale-110 transition"
                style={{ backgroundColor: color === 'transparent' ? '#1e293b' : color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={handleLinkPrompt}
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
        title="Add Link"
      >
        <Link className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-800 mx-1" />

      {/* Lists */}
      <button 
        onClick={() => executeCommand('insertUnorderedList')}
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button 
        onClick={() => executeCommand('insertOrderedList')}
        className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-slate-100 transition"
        title="Numbered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      {/* Eraser / Clear format */}
      <button 
        onClick={() => executeCommand('removeFormat')}
        className="p-1.5 hover:bg-slate-800 rounded text-red-400 hover:text-red-300 transition"
        title="Clear Formatting"
      >
        <Eraser className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
