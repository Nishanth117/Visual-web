import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { 
  Eye, EyeOff, Lock, Unlock, Trash2, ChevronRight, ChevronDown, 
  Layers, FolderTree 
} from 'lucide-react';
import type { ComponentNode } from '../../types';

export const LayersPanel: React.FC = () => {
  const { 
    project, 
    activePageId, 
    selectedElementId, 
    hoveredElementId,
    setSelectedElementId, 
    setHoveredElementId,
    updateComponent, 
    deleteComponent 
  } = useProjectStore();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'root': true });
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activePage = project.pages.find(p => p.id === activePageId);
  if (!activePage) return null;

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleStartRename = (node: ComponentNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditingName(node.name || node.type);
  };

  const handleRenameSubmit = (nodeId: string) => {
    if (editingName.trim()) {
      updateComponent(nodeId, { name: editingName.trim() });
    }
    setEditingNodeId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, nodeId: string) => {
    if (e.key === 'Enter') handleRenameSubmit(nodeId);
    if (e.key === 'Escape') setEditingNodeId(null);
  };

  const handleToggleHide = (node: ComponentNode, e: React.MouseEvent) => {
    e.stopPropagation();
    updateComponent(node.id, { isHidden: !node.isHidden });
  };

  const handleToggleLock = (node: ComponentNode, e: React.MouseEvent) => {
    e.stopPropagation();
    updateComponent(node.id, { isLocked: !node.isLocked });
  };

  const handleDelete = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId === 'root') return;
    deleteComponent(nodeId);
  };

  const renderNode = (node: ComponentNode, depth: number = 0): React.ReactNode => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = selectedElementId === node.id;
    const isHovered = hoveredElementId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isEditing = editingNodeId === node.id;

    return (
      <div key={node.id} className="text-xs select-none">
        {/* Layer Header Row */}
        <div 
          onClick={() => setSelectedElementId(node.id)}
          onMouseEnter={() => setHoveredElementId(node.id)}
          onMouseLeave={() => setHoveredElementId(null)}
          className={`flex items-center justify-between py-1.5 px-3 cursor-pointer group transition-colors ${isSelected ? 'bg-sky-950/60 text-sky-400 font-semibold border-l-2 border-sky-500' : isHovered ? 'bg-slate-800/40 text-slate-200' : 'hover:bg-slate-900/50 text-slate-400'}`}
          style={{ paddingLeft: `${Math.max(12, depth * 12)}px` }}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Expand arrow */}
            {hasChildren ? (
              <button 
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {/* Icon */}
            <span className="text-slate-600 flex-shrink-0">
              <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
            </span>

            {/* Layer Name / Rename input */}
            {isEditing ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameSubmit(node.id)}
                onKeyDown={(e) => handleKeyDown(e, node.id)}
                autoFocus
                className="bg-slate-950 border border-slate-750 text-slate-200 rounded px-1 py-0.5 outline-none text-[11px] w-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                onDoubleClick={(e) => handleStartRename(node, e)}
                className="truncate text-[11px] hover:text-slate-200"
                title="Double click to rename"
              >
                {node.name || `${node.tag.toUpperCase()} (${node.type})`}
              </span>
            )}
          </div>

          {/* Action buttons (Lock, Hide, Delete) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button 
              onClick={(e) => handleToggleLock(node, e)}
              className={`p-0.5 hover:bg-slate-800 rounded transition ${node.isLocked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'}`}
              title={node.isLocked ? "Unlock Element" : "Lock Element"}
            >
              {node.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
            <button 
              onClick={(e) => handleToggleHide(node, e)}
              className={`p-0.5 hover:bg-slate-800 rounded transition ${node.isHidden ? 'text-slate-500' : 'text-slate-600 hover:text-slate-300'}`}
              title={node.isHidden ? "Show Element" : "Hide Element"}
            >
              {node.isHidden ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3" />}
            </button>
            {node.id !== 'root' && (
              <button 
                onClick={(e) => handleDelete(node.id, e)}
                className="p-0.5 hover:bg-slate-800 text-slate-600 hover:text-red-400 rounded transition"
                title="Delete Element"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-850/50 ml-3">
            {(node.children || []).map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <FolderTree className="w-4 h-4 text-sky-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Layers Tree</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {renderNode(activePage.rootComponent)}
      </div>
    </div>
  );
};
