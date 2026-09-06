import { useState } from 'react';
import { useProjectStore } from './store/projectStore';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ComponentToolbox } from './components/sidebar/ComponentToolbox';
import { LayersPanel } from './components/sidebar/LayersPanel';
import { Explorer } from './components/sidebar/Explorer';
import { AssetManager } from './components/assets/AssetManager';
import { Canvas } from './components/editor/Canvas';
import { PropertyPanel } from './components/property-panel/PropertyPanel';
import { CodeEditor } from './components/code-editor/CodeEditor';
import { exportProjectToZip } from './services/projectExporter';
import { 
  Settings, LayoutGrid, Layers, Folder, Image, 
  X, Sparkles, Palette, Code2, FilePlus, UserRound, BriefcaseBusiness
} from 'lucide-react';

export default function App() {
  const {
    project,
    isPreviewMode,
    loadTemplate,
    updateSettings,
  } = useProjectStore();

  const [activeLeftTab, setActiveLeftTab] = useState<'explorer' | 'toolbox' | 'layers' | 'assets'>('toolbox');
  const [isLeftExpanded, setIsLeftExpanded] = useState(true);
  const [activeView, setActiveView] = useState<'visual' | 'code'>('visual');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Trigger project export to ZIP
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportProjectToZip(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'website'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export project', err);
      alert('Failed to generate ZIP project exporter.');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenFile = (fileType: 'html' | 'css' | 'js' | 'settings') => {
    if (fileType === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setActiveView('code');
    }
  };

  const handleSelectTemplate = (name: 'blank' | 'portfolio' | 'business') => {
    loadTemplate(name);
    setIsTemplateModalOpen(false);
  };

  return (
    <div className={`h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden ${isPreviewMode ? 'preview-mode' : ''}`}>
      
      {/* Top Bar Header */}
      <TopToolbar 
        onExport={handleExport} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      {/* Main Workspace Layout Wrapper */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ================= LEFT ICON STRIP (VS Code style) ================= */}
        {!isPreviewMode && (
          <div className="w-12 bg-slate-950 border-r border-slate-850 flex flex-col items-center py-4 justify-between select-none">
            <div className="flex flex-col gap-5 items-center w-full">
              <button 
                onClick={() => {
                  if (activeLeftTab === 'explorer' && isLeftExpanded) {
                    setIsLeftExpanded(false);
                  } else {
                    setActiveLeftTab('explorer');
                    setIsLeftExpanded(true);
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${activeLeftTab === 'explorer' && isLeftExpanded ? 'text-sky-400 bg-slate-900' : 'text-slate-500 hover:text-slate-200'}`}
                title="Workspace Explorer"
              >
                <Folder className="w-5 h-5" />
              </button>

              <button 
                onClick={() => {
                  if (activeLeftTab === 'toolbox' && isLeftExpanded) {
                    setIsLeftExpanded(false);
                  } else {
                    setActiveLeftTab('toolbox');
                    setIsLeftExpanded(true);
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${activeLeftTab === 'toolbox' && isLeftExpanded ? 'text-sky-400 bg-slate-900' : 'text-slate-500 hover:text-slate-200'}`}
                title="Component Catalog"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              <button 
                onClick={() => {
                  if (activeLeftTab === 'layers' && isLeftExpanded) {
                    setIsLeftExpanded(false);
                  } else {
                    setActiveLeftTab('layers');
                    setIsLeftExpanded(true);
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${activeLeftTab === 'layers' && isLeftExpanded ? 'text-sky-400 bg-slate-900' : 'text-slate-500 hover:text-slate-200'}`}
                title="Layers Tree"
              >
                <Layers className="w-5 h-5" />
              </button>

              <button 
                onClick={() => {
                  if (activeLeftTab === 'assets' && isLeftExpanded) {
                    setIsLeftExpanded(false);
                  } else {
                    setActiveLeftTab('assets');
                    setIsLeftExpanded(true);
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${activeLeftTab === 'assets' && isLeftExpanded ? 'text-sky-400 bg-slate-900' : 'text-slate-500 hover:text-slate-200'}`}
                title="Asset Manager"
              >
                <Image className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 items-center">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-lg hover:text-slate-200 transition-colors ${isSettingsOpen ? 'text-sky-400' : 'text-slate-500'}`}
                title="Project Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= LEFT DRAWER SIDEBAR ================= */}
        {!isPreviewMode && isLeftExpanded && (
          <div className="w-64 border-r border-slate-800 bg-slate-900/60 overflow-hidden flex-shrink-0 animate-slide-in">
            {activeLeftTab === 'explorer' && <Explorer onOpenFile={handleOpenFile} />}
            {activeLeftTab === 'toolbox' && <ComponentToolbox />}
            {activeLeftTab === 'layers' && <LayersPanel />}
            {activeLeftTab === 'assets' && <AssetManager />}
          </div>
        )}

        {/* ================= CENTER WORKSPACE ================= */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
          
          {/* Mode Switch Tabs (Visual vs Code View) */}
          {!isPreviewMode && (
            <div className="h-10 bg-slate-905 border-b border-slate-800 flex items-center px-4 justify-between text-xs select-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveView('visual')}
                  className={`px-3 py-1 rounded-md transition font-semibold flex items-center gap-1.5 ${activeView === 'visual' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  Visual Canvas
                </button>
                <button
                  onClick={() => setActiveView('code')}
                  className={`px-3 py-1 rounded-md transition font-semibold flex items-center gap-1.5 ${activeView === 'code' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Monaco Code Editor
                </button>
              </div>

              <div className="text-[10px] text-slate-500 italic">
                Drag elements to reorder them. Double-click text to edit. Code updates live from canvas changes.
              </div>
            </div>
          )}

          {/* Core Panel Content */}
          <div className="flex-1 flex overflow-hidden">
            {activeView === 'visual' ? (
              <>
                <Canvas />
                {!isPreviewMode && (
                  <div className="w-80 border-l border-slate-800 flex-shrink-0">
                    <PropertyPanel />
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 h-full">
                <CodeEditor />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ================= PROJECT SETTINGS MODAL ================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl select-none animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-400" /> Project Configurations
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">PROJECT NAME</label>
                <input 
                  type="text" 
                  value={project.name}
                  onChange={(e) => useProjectStore.getState().updateSettings({ title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500 transition"
                  placeholder="My Creative Project"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">SEO DESCRIPTION</label>
                <textarea 
                  value={project.settings.description}
                  onChange={(e) => updateSettings({ description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500 transition resize-none"
                  placeholder="Website meta description for search index search engines..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">AUTHOR</label>
                <input 
                  type="text" 
                  value={project.settings.author}
                  onChange={(e) => updateSettings({ author: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500 transition"
                  placeholder="Developer Pro"
                />
              </div>

              <div className="border-t border-slate-800 pt-4 mt-6 flex justify-end gap-2">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-5 py-2 rounded-lg transition shadow"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TEMPLATE PICKER MODAL (Startup) ================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col items-center">
            
            <Sparkles className="w-10 h-10 text-sky-400 mb-2 animate-bounce" />
            <h2 className="text-xl font-extrabold text-slate-100 tracking-wider text-center">Welcome to VividBuilder</h2>
            <p className="text-xs text-slate-450 mt-1 max-w-md text-center text-slate-500 leading-normal">
              Select a pre-designed template layout or initialize a clean workspace to start building your responsive HTML/CSS website.
            </p>

            <div className="grid grid-cols-3 gap-4 w-full mt-8">
              {/* Blank */}
              <div 
                onClick={() => handleSelectTemplate('blank')}
                className="group border border-slate-800 bg-slate-950/40 p-5 rounded-xl hover:border-sky-500/80 cursor-pointer flex flex-col items-center text-center transition hover:bg-slate-900/40"
              >
                <div className="w-10 h-10 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <FilePlus className="w-5 h-5 text-slate-500" />
                </div>
                <span className="font-bold text-slate-200 text-xs">Blank Page</span>
                <span className="text-[10px] text-slate-500 mt-1">Start completely from scratch.</span>
              </div>

              {/* Developer Portfolio */}
              <div 
                onClick={() => handleSelectTemplate('portfolio')}
                className="group border border-slate-800 bg-slate-950/40 p-5 rounded-xl hover:border-sky-500/80 cursor-pointer flex flex-col items-center text-center transition hover:bg-slate-900/40"
              >
                <div className="w-10 h-10 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <UserRound className="w-5 h-5 text-sky-400" />
                </div>
                <span className="font-bold text-slate-200 text-xs">Dev Portfolio</span>
                <span className="text-[10px] text-slate-500 mt-1">Hero, projects grid, contact form.</span>
              </div>

              {/* Corporate landing */}
              <div 
                onClick={() => handleSelectTemplate('business')}
                className="group border border-slate-800 bg-slate-950/40 p-5 rounded-xl hover:border-sky-500/80 cursor-pointer flex flex-col items-center text-center transition hover:bg-slate-900/40"
              >
                <div className="w-10 h-10 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <BriefcaseBusiness className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-bold text-slate-200 text-xs">Business Landing</span>
                <span className="text-[10px] text-slate-500 mt-1">Sleek corporate consulting homepage.</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 mt-8">
              Tip: You can re-open project settings or export your code layout anytime.
            </div>
          </div>
        </div>
      )}

      {/* Exporting Loading state overlay */}
      {exporting && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[300] select-none text-xs gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-slate-300">Compiling visual layout and building ZIP download...</span>
        </div>
      )}

    </div>
  );
}
