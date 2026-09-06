import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { 
  Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, Download, 
  ChevronDown, Settings, Sun, Moon, Plus, Trash2, FileText 
} from 'lucide-react';

interface TopToolbarProps {
  onExport: () => void;
  onOpenSettings: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onExport, onOpenSettings }) => {
  const {
    project,
    activePageId,
    viewport,
    isPreviewMode,
    past,
    future,
    undo,
    redo,
    setViewport,
    setPreviewMode,
    setActivePage,
    addPage,
    deletePage,
    updateSettings,
  } = useProjectStore();

  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  const activePage = project.pages.find(p => p.id === activePageId);

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;
    addPage(newPageName);
    setNewPageName('');
    setIsNewPageModalOpen(false);
    setIsPageMenuOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === 'light') {
      root.classList.remove('dark-theme');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark-theme');
      root.style.colorScheme = 'dark';
    }
  };

  if (isPreviewMode) {
    return (
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-slate-200 select-none z-50">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sky-400 text-sm">VividBuilder Preview Mode</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            Viewing: {activePage?.name} ({activePage?.path})
          </span>
        </div>

        {/* Viewport controls inside Preview too */}
        <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
          <button 
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-md transition ${viewport === 'desktop' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-md transition ${viewport === 'tablet' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-md transition ${viewport === 'mobile' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => setPreviewMode(false)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-1.5 rounded-md text-xs transition shadow-md shadow-sky-900/20"
        >
          ← Back to Editor
        </button>
      </div>
    );
  }

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-slate-200 select-none z-50">
      
      {/* Left: Branding & Sub-menus */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-wider text-sky-400 cursor-pointer">VIVID</span>
          <div className="h-4 w-px bg-slate-800" />
          <input 
            type="text" 
            value={project.name}
            onChange={(e) => updateSettings({ title: e.target.value })}
            className="bg-transparent hover:bg-slate-800 focus:bg-slate-950 focus:ring-1 focus:ring-sky-500 text-slate-300 font-semibold px-2 py-0.5 rounded outline-none w-36 text-sm transition"
            title="Rename Project"
          />
        </div>

        {/* Traditional IDE menus */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="hover:text-slate-100 cursor-pointer transition">File</span>
          <span className="hover:text-slate-100 cursor-pointer transition">Edit</span>
          <span className="hover:text-slate-100 cursor-pointer transition">View</span>
          <span className="hover:text-slate-100 cursor-pointer transition">Insert</span>
          <span className="hover:text-slate-100 cursor-pointer transition">Design</span>
          <span onClick={onOpenSettings} className="hover:text-slate-100 cursor-pointer transition flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" /> Settings
          </span>
        </div>
      </div>

      {/* Center: Device Switcher & Page Switcher */}
      <div className="flex items-center gap-6">
        {/* Pages Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
            className="flex items-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 transition"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Page: {activePage?.name || 'None'}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isPageMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-slate-950 border border-slate-800 rounded-lg shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-slate-500 font-bold border-b border-slate-800 flex justify-between items-center">
                <span>PROJECT PAGES</span>
                <button 
                  onClick={() => setIsNewPageModalOpen(true)}
                  className="p-1 hover:bg-slate-800 hover:text-sky-400 rounded transition"
                  title="Create Page"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {project.pages.map((p) => (
                  <div 
                    key={p.id}
                    className={`group flex items-center justify-between px-3 py-2 cursor-pointer transition ${p.id === activePageId ? 'bg-sky-950/60 text-sky-400 font-medium' : 'hover:bg-slate-900 text-slate-300'}`}
                  >
                    <span onClick={() => { setActivePage(p.id); setIsPageMenuOpen(false); }} className="flex-1">
                      {p.name} <span className="text-[10px] text-slate-500">({p.path})</span>
                    </span>
                    {p.id !== 'index' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete page "${p.name}"?`)) {
                            deletePage(p.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 rounded transition"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Viewport Selectors */}
        <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
          <button 
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-md transition ${viewport === 'desktop' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Desktop Size"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-md transition ${viewport === 'tablet' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Tablet Size"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-md transition ${viewport === 'mobile' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Mobile Size"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Actions (Undo/Redo, Preview, Export, Theme) */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo */}
        <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
          <button 
            onClick={undo}
            disabled={past.length === 0}
            className={`p-1.5 rounded-md transition ${past.length > 0 ? 'text-slate-300 hover:bg-slate-900 hover:text-slate-100' : 'text-slate-600 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={redo}
            disabled={future.length === 0}
            className={`p-1.5 rounded-md transition ${future.length > 0 ? 'text-slate-300 hover:bg-slate-900 hover:text-slate-100' : 'text-slate-600 cursor-not-allowed'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 transition"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Preview & Export */}
        <button 
          onClick={() => setPreviewMode(true)}
          className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 transition"
          title="Live Preview"
        >
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Preview</span>
        </button>

        <button 
          onClick={onExport}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold px-4 py-1.5 transition shadow-lg shadow-sky-950/20"
          title="Export complete site"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* New Page Modal Dialog */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-80 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-4">Create New Page</h3>
            <form onSubmit={handleAddPage} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">PAGE NAME</label>
                <input 
                  type="text" 
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="e.g. Services"
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500 transition"
                />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => setIsNewPageModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 rounded-md transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-1.5 rounded-md text-xs transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
