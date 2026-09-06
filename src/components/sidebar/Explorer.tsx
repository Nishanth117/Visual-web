import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { 
  Folder, FolderOpen, FileCode, FileImage, FileText, ChevronRight, 
  ChevronDown, Globe, Terminal 
} from 'lucide-react';

interface ExplorerProps {
  onOpenFile: (fileType: 'html' | 'css' | 'js' | 'settings', pageId?: string) => void;
}

export const Explorer: React.FC<ExplorerProps> = ({ onOpenFile }) => {
  const { project, activePageId } = useProjectStore();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    pages: true,
    css: false,
    js: false,
    assets: false,
  });

  const toggleFolder = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileClick = (fileType: 'html' | 'css' | 'js' | 'settings', pageId?: string) => {
    onOpenFile(fileType, pageId);
  };

  const pages = project.pages;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none text-xs">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Explorer</h2>
        <span className="text-[10px] text-slate-500 font-mono">WORKSPACE</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Workspace Root */}
        <div>
          <div 
            onClick={(e) => toggleFolder('root', e)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-850 cursor-pointer font-bold text-slate-200"
          >
            {expandedFolders.root ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">{project.name.toUpperCase()}</span>
          </div>

          {expandedFolders.root && (
            <div className="pl-4">
              {/* index.html (Homepage) */}
              <div 
                onClick={() => handleFileClick('html', 'index')}
                className={`flex items-center gap-2 px-3 py-1.5 hover:bg-slate-850 cursor-pointer transition ${activePageId === 'index' ? 'text-sky-400 font-semibold bg-sky-950/20' : 'text-slate-400'}`}
              >
                <FileCode className="w-3.5 h-3.5 text-orange-400" />
                <span>index.html</span>
                <span className="text-[9px] bg-slate-800 px-1 py-0.2 rounded text-slate-500 ml-auto">Home</span>
              </div>

              {/* pages/ directory */}
              <div>
                <div 
                  onClick={(e) => toggleFolder('pages', e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-850 cursor-pointer text-slate-300"
                >
                  {expandedFolders.pages ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  {expandedFolders.pages ? <FolderOpen className="w-3.5 h-3.5 text-sky-500" /> : <Folder className="w-3.5 h-3.5 text-sky-500" />}
                  <span>pages</span>
                </div>

                {expandedFolders.pages && (
                  <div className="pl-4">
                    {pages.filter(p => p.id !== 'index').map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handleFileClick('html', p.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 hover:bg-slate-850 cursor-pointer transition ${activePageId === p.id ? 'text-sky-400 font-semibold bg-sky-950/20' : 'text-slate-400'}`}
                      >
                        <FileCode className="w-3.5 h-3.5 text-orange-400" />
                        <span className="truncate">{p.id}.html</span>
                      </div>
                    ))}
                    {pages.filter(p => p.id !== 'index').length === 0 && (
                      <div className="px-3 py-1 text-[10px] text-slate-600 italic">No extra pages</div>
                    )}
                  </div>
                )}
              </div>

              {/* css/ directory */}
              <div>
                <div 
                  onClick={(e) => toggleFolder('css', e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-850 cursor-pointer text-slate-300"
                >
                  {expandedFolders.css ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  {expandedFolders.css ? <FolderOpen className="w-3.5 h-3.5 text-sky-500" /> : <Folder className="w-3.5 h-3.5 text-sky-500" />}
                  <span>css</span>
                </div>

                {expandedFolders.css && (
                  <div className="pl-4">
                    <div 
                      onClick={() => handleFileClick('css')}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-850 cursor-pointer text-slate-400"
                    >
                      <FileCode className="w-3.5 h-3.5 text-teal-400" />
                      <span>style.css</span>
                    </div>
                  </div>
                )}
              </div>

              {/* js/ directory */}
              <div>
                <div 
                  onClick={(e) => toggleFolder('js', e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-850 cursor-pointer text-slate-300"
                >
                  {expandedFolders.js ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  {expandedFolders.js ? <FolderOpen className="w-3.5 h-3.5 text-sky-500" /> : <Folder className="w-3.5 h-3.5 text-sky-500" />}
                  <span>js</span>
                </div>

                {expandedFolders.js && (
                  <div className="pl-4">
                    <div 
                      onClick={() => handleFileClick('js')}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-850 cursor-pointer text-slate-400"
                    >
                      <Terminal className="w-3.5 h-3.5 text-yellow-400" />
                      <span>script.js</span>
                    </div>
                  </div>
                )}
              </div>

              {/* assets/ directory */}
              <div>
                <div 
                  onClick={(e) => toggleFolder('assets', e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-850 cursor-pointer text-slate-300"
                >
                  {expandedFolders.assets ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  {expandedFolders.assets ? <FolderOpen className="w-3.5 h-3.5 text-sky-500" /> : <Folder className="w-3.5 h-3.5 text-sky-500" />}
                  <span>assets</span>
                </div>

                {expandedFolders.assets && (
                  <div className="pl-4">
                    {project.assets.map(asset => (
                      <div 
                        key={asset.id}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-850 text-slate-400"
                      >
                        <FileImage className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate" title={asset.name}>{asset.name}</span>
                      </div>
                    ))}
                    {project.assets.length === 0 && (
                      <div className="px-3 py-1.5 text-[10px] text-slate-650 italic">No asset files</div>
                    )}
                  </div>
                )}
              </div>

              {/* README.md */}
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-850 cursor-not-allowed text-slate-600">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>README.md</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
