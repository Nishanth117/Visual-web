import React, { useState } from 'react';
import { useProjectStore, findNode } from '../../store/projectStore';
import { 
  Type, Layout, Palette, Sparkles, Trash2, Plus, 
  AlignLeft, AlignCenter, AlignRight 
} from 'lucide-react';
import type { ComponentNode, InteractionEvent, InteractionAction } from '../../types';

export const PropertyPanel: React.FC = () => {
  const {
    project,
    activePageId,
    selectedElementId,
    viewport,
    updateComponent,
    updateComponentStyle,
    deleteComponent,
    addInteraction,
    deleteInteraction
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'style' | 'content' | 'interactions'>('style');
  const [newTrigger, setNewTrigger] = useState<InteractionEvent>('click');
  const [newAction, setNewAction] = useState<InteractionAction>('toggle');
  const [newTargetId, setNewTargetId] = useState<string>('');
  const [newActionVal, setNewActionVal] = useState<string>('');

  const activePage = project.pages.find(p => p.id === activePageId);
  if (!activePage) return null;

  const selectedNode = selectedElementId 
    ? findNode(activePage.rootComponent, selectedElementId) 
    : null;

  if (!selectedNode) {
    return (
      <div className="h-full bg-slate-900 border-l border-slate-800 text-slate-400 p-8 flex flex-col items-center justify-center text-center select-none text-xs gap-3">
        <Sparkles className="w-8 h-8 text-slate-700 animate-pulse" />
        <p className="font-semibold text-slate-500">No element selected</p>
        <p className="text-[10px] text-slate-600 max-w-xs">
          Click any element on the canvas to inspect and edit its layout, content, styles, and hover actions.
        </p>
      </div>
    );
  }

  // Get active style value based on selected viewport
  const getStyleValue = (key: string): string => {
    if (viewport === 'tablet') {
      return selectedNode.tabletStyles?.[key] ?? selectedNode.styles[key] ?? '';
    }
    if (viewport === 'mobile') {
      return selectedNode.mobileStyles?.[key] ?? selectedNode.tabletStyles?.[key] ?? selectedNode.styles[key] ?? '';
    }
    return selectedNode.styles[key] ?? '';
  };

  const handleStyleChange = (key: string, value: string) => {
    updateComponentStyle(selectedNode.id, key, value);
  };

  const handleAttrChange = (key: string, value: string) => {
    const nextAttrs = { ...(selectedNode.attributes || {}), [key]: value };
    updateComponent(selectedNode.id, { attributes: nextAttrs });
  };

  const handleContentChange = (content: string) => {
    updateComponent(selectedNode.id, { content });
  };

  // Find all components in the active page to serve as targets in the dropdown list
  const gatherTargets = (node: ComponentNode, list: { id: string; name: string }[] = []) => {
    list.push({ id: node.id, name: node.name || `${node.tag.toUpperCase()} (${node.type})` });
    (node.children || []).forEach(child => gatherTargets(child, list));
    return list;
  };
  const availableTargets = gatherTargets(activePage.rootComponent);

  const handleAddInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction({
      triggerElementId: selectedNode.id,
      triggerEvent: newTrigger,
      actionType: newAction,
      targetElementId: newTargetId || undefined,
      actionValue: newActionVal || undefined
    });
    setNewTargetId('');
    setNewActionVal('');
  };

  const currentInteractions = activePage.interactions.filter(
    i => i.triggerElementId === selectedNode.id
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-300 select-none text-xs">
      
      {/* Element Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] bg-sky-950 text-sky-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {selectedNode.type}
          </span>
          <button 
            onClick={() => deleteComponent(selectedNode.id)}
            className="text-slate-500 hover:text-red-400 p-1 rounded transition"
            title="Delete Node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <h3 className="text-slate-100 font-bold text-sm mt-2">
          {selectedNode.name || `${selectedNode.tag.toUpperCase()} element`}
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-center">
        {(['style', 'content', 'interactions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 font-bold uppercase tracking-wider text-[10px] border-b-2 transition ${activeTab === tab ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panel Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* ================= STYLE TAB ================= */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            
            {/* Viewport Notice */}
            {viewport !== 'desktop' && (
              <div className="bg-amber-950/50 border border-amber-900 text-amber-400 p-2.5 rounded-lg text-[10px] mb-2 leading-relaxed">
                ✍️ You are modifying styles for <strong>{viewport.toUpperCase()} viewports</strong> only. These override the desktop styles.
              </div>
            )}

            {/* Layout Box */}
            <div className="border-b border-slate-800 pb-4">
              <h4 className="font-bold text-slate-400 flex items-center gap-1.5 mb-3">
                <Layout className="w-3.5 h-3.5 text-sky-400" /> Layout & Sizing
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">DISPLAY</label>
                  <select 
                    value={getStyleValue('display')}
                    onChange={(e) => handleStyleChange('display', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="">(Inherit)</option>
                    <option value="block">Block</option>
                    <option value="inline-block">Inline Block</option>
                    <option value="flex">Flexbox</option>
                    <option value="grid">CSS Grid</option>
                    <option value="none">None (Hidden)</option>
                  </select>
                </div>
                
                {getStyleValue('display') === 'flex' && (
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">DIRECTION</label>
                    <select 
                      value={getStyleValue('flex-direction')}
                      onChange={(e) => handleStyleChange('flex-direction', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    >
                      <option value="row">Row (Horizontal)</option>
                      <option value="column">Column (Vertical)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Size inputs */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">WIDTH</label>
                  <input 
                    type="text" 
                    value={getStyleValue('width')}
                    onChange={(e) => handleStyleChange('width', e.target.value)}
                    placeholder="e.g. 100%, 300px, auto"
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">HEIGHT</label>
                  <input 
                    type="text" 
                    value={getStyleValue('height')}
                    onChange={(e) => handleStyleChange('height', e.target.value)}
                    placeholder="e.g. 100vh, 200px, auto"
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Spacing Box (Margin & Padding) */}
            <div className="border-b border-slate-800 pb-4">
              <h4 className="font-bold text-slate-400 flex items-center gap-1.5 mb-3">
                <Palette className="w-3.5 h-3.5 text-emerald-400" /> Spacing (Margin / Padding)
              </h4>
              <div className="space-y-3">
                {/* Margins */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 font-bold">MARGINS</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <div>
                      <input 
                        type="text" value={getStyleValue('margin-top')} 
                        onChange={(e) => handleStyleChange('margin-top', e.target.value)} 
                        placeholder="Top" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" value={getStyleValue('margin-right')} 
                        onChange={(e) => handleStyleChange('margin-right', e.target.value)} 
                        placeholder="Right" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" value={getStyleValue('margin-bottom')} 
                        onChange={(e) => handleStyleChange('margin-bottom', e.target.value)} 
                        placeholder="Bottom" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" value={getStyleValue('margin-left')} 
                        onChange={(e) => handleStyleChange('margin-left', e.target.value)} 
                        placeholder="Left" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Paddings */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 font-bold">PADDINGS</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <div>
                      <input 
                        type="text" value={getStyleValue('padding-top')} 
                        onChange={(e) => handleStyleChange('padding-top', e.target.value)} 
                        placeholder="Top" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" value={getStyleValue('padding-right')} 
                        onChange={(e) => handleStyleChange('padding-right', e.target.value)} 
                        placeholder="Right" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" value={getStyleValue('padding-bottom')} 
                        onChange={(e) => handleStyleChange('padding-bottom', e.target.value)} 
                        placeholder="Bottom" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" value={getStyleValue('padding-left')} 
                        onChange={(e) => handleStyleChange('padding-left', e.target.value)} 
                        placeholder="Left" className="w-full text-center bg-slate-950 border border-slate-850 rounded py-0.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="border-b border-slate-800 pb-4">
              <h4 className="font-bold text-slate-400 flex items-center gap-1.5 mb-3">
                <Type className="w-3.5 h-3.5 text-indigo-400" /> Typography
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">FONT SIZE</label>
                    <input 
                      type="text" 
                      value={getStyleValue('font-size')}
                      onChange={(e) => handleStyleChange('font-size', e.target.value)}
                      placeholder="e.g. 16px, 2rem"
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">FONT FAMILY</label>
                    <select
                      value={getStyleValue('font-family')}
                      onChange={(e) => handleStyleChange('font-family', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    >
                      <option value="">(Default)</option>
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Outfit, sans-serif">Outfit</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="monospace">Monospace</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">FONT WEIGHT</label>
                    <select
                      value={getStyleValue('font-weight')}
                      onChange={(e) => handleStyleChange('font-weight', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    >
                      <option value="">(Inherit)</option>
                      <option value="300">Light (300)</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra-Bold (800)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">TEXT ALIGN</label>
                    <div className="flex bg-slate-950 border border-slate-850 rounded p-0.5">
                      <button 
                        onClick={() => handleStyleChange('text-align', 'left')}
                        className={`flex-1 p-1 rounded transition ${getStyleValue('text-align') === 'left' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        <AlignLeft className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button 
                        onClick={() => handleStyleChange('text-align', 'center')}
                        className={`flex-1 p-1 rounded transition ${getStyleValue('text-align') === 'center' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        <AlignCenter className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button 
                        onClick={() => handleStyleChange('text-align', 'right')}
                        className={`flex-1 p-1 rounded transition ${getStyleValue('text-align') === 'right' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        <AlignRight className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">LINE HEIGHT</label>
                    <input 
                      type="text" 
                      value={getStyleValue('line-height')}
                      onChange={(e) => handleStyleChange('line-height', e.target.value)}
                      placeholder="e.g. 1.5, 24px"
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">TEXT COLOR</label>
                    <div className="flex gap-1">
                      <input 
                        type="color" 
                        value={getStyleValue('color').startsWith('#') ? getStyleValue('color') : '#ffffff'}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="bg-transparent w-8 h-7 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={getStyleValue('color')}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance (Bg, Border, Shadow) */}
            <div className="pb-4">
              <h4 className="font-bold text-slate-400 flex items-center gap-1.5 mb-3">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Background & Style
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">BG COLOR</label>
                  <div className="flex gap-1">
                    <input 
                      type="color" 
                      value={getStyleValue('background-color').startsWith('#') ? getStyleValue('background-color') : '#1e293b'}
                      onChange={(e) => handleStyleChange('background-color', e.target.value)}
                      className="bg-transparent w-8 h-7 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={getStyleValue('background-color')}
                      onChange={(e) => handleStyleChange('background-color', e.target.value)}
                      placeholder="e.g. #1e293b, transparent"
                      className="flex-1 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">BORDER RADIUS</label>
                    <input 
                      type="text" 
                      value={getStyleValue('border-radius')}
                      onChange={(e) => handleStyleChange('border-radius', e.target.value)}
                      placeholder="e.g. 8px, 50%"
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">BORDER</label>
                    <input 
                      type="text" 
                      value={getStyleValue('border')}
                      onChange={(e) => handleStyleChange('border', e.target.value)}
                      placeholder="e.g. 1px solid #fff"
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">BOX SHADOW</label>
                    <input 
                      type="text" 
                      value={getStyleValue('box-shadow')}
                      onChange={(e) => handleStyleChange('box-shadow', e.target.value)}
                      placeholder="e.g. 0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">OPACITY (0 to 1)</label>
                    <input 
                      type="number" 
                      min="0" max="1" step="0.1"
                      value={getStyleValue('opacity') || '1'}
                      onChange={(e) => handleStyleChange('opacity', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= CONTENT TAB ================= */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            
            {/* Custom attributes ID */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">CUSTOM HTML ID</label>
              <input 
                type="text" 
                value={selectedNode.idAttribute || ''}
                onChange={(e) => updateComponent(selectedNode.id, { idAttribute: e.target.value })}
                placeholder="e.g. my-custom-button"
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 font-mono text-[11px]"
              />
            </div>

            {/* Content Field (if text or tag fits) */}
            {selectedNode.content !== undefined && (
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">TEXT CONTENT</label>
                <textarea 
                  value={selectedNode.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 outline-none"
                  placeholder="Insert inner text content..."
                />
              </div>
            )}

            {/* Custom attributes fields */}
            {selectedNode.tag === 'img' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-bold">IMAGE URL (SRC)</label>
                  <input 
                    type="text" 
                    value={selectedNode.attributes.src || ''}
                    onChange={(e) => handleAttrChange('src', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-bold">ALT TEXT</label>
                  <input 
                    type="text" 
                    value={selectedNode.attributes.alt || ''}
                    onChange={(e) => handleAttrChange('alt', e.target.value)}
                    placeholder="Descriptive explanation"
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </>
            )}

            {selectedNode.tag === 'a' && (
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">LINK URL (HREF)</label>
                <input 
                  type="text" 
                  value={selectedNode.attributes.href || ''}
                  onChange={(e) => handleAttrChange('href', e.target.value)}
                  placeholder="https://google.com or #home"
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
            )}

            {selectedNode.tag === 'input' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-bold">INPUT TYPE</label>
                  <select 
                    value={selectedNode.attributes.type || 'text'}
                    onChange={(e) => handleAttrChange('type', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="password">Password</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-bold">PLACEHOLDER</label>
                  <input 
                    type="text" 
                    value={selectedNode.attributes.placeholder || ''}
                    onChange={(e) => handleAttrChange('placeholder', e.target.value)}
                    placeholder="Placeholder..."
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= INTERACTIONS TAB ================= */}
        {activeTab === 'interactions' && (
          <div className="space-y-4">
            
            {/* Helper Alert */}
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <span className="font-bold text-sky-400 block mb-1">Interaction Script Builder</span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Define visual click/hover scripts. VividBuilder will compile these into responsive JavaScript in the exported site.
              </p>
            </div>

            {/* List Existing Interactions */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 block font-bold">CURRENT NODE INTERACTIONS ({currentInteractions.length})</span>
              {currentInteractions.map(inter => {
                const targetNode = availableTargets.find(t => t.id === inter.targetElementId);
                return (
                  <div key={inter.id} className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-emerald-400 uppercase text-[9px]">{inter.triggerEvent}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-sky-400 uppercase text-[9px]">{inter.actionType}</span>
                      </div>
                      {targetNode && (
                        <div className="text-[10px] text-slate-400 truncate">
                          Target: <span className="font-mono text-slate-300">{targetNode.name}</span>
                        </div>
                      )}
                      {inter.actionValue && (
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1 py-0.5 rounded max-w-[170px] truncate" title={inter.actionValue}>
                          Val: {inter.actionValue}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteInteraction(inter.id)}
                      className="text-slate-600 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {currentInteractions.length === 0 && (
                <div className="text-[10px] text-slate-650 italic text-center py-2">No interactions configured. Add one below.</div>
              )}
            </div>

            {/* Add New Interaction Form */}
            <form onSubmit={handleAddInteractionSubmit} className="bg-slate-950 border border-slate-850 p-3 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">New Action</span>
                <button type="submit" className="text-sky-400 hover:text-sky-300 font-bold text-[10px] flex items-center gap-0.5">
                  <Plus className="w-3.5 h-3.5" /> Save
                </button>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 block mb-0.5 font-bold">WHEN EVENT</label>
                <select 
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value as InteractionEvent)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                >
                  <option value="click">Click</option>
                  <option value="hover">Hover (Mouseover)</option>
                  <option value="mouseenter">Mouse Enter</option>
                  <option value="mouseleave">Mouse Leave</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 block mb-0.5 font-bold">DO ACTION</label>
                <select 
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value as InteractionAction)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                >
                  <option value="toggle">Toggle Visibility</option>
                  <option value="show">Show Element</option>
                  <option value="hide">Hide Element</option>
                  <option value="open_modal">Open Modal</option>
                  <option value="close_modal">Close Modal</option>
                  <option value="change_text">Change Text Content</option>
                  <option value="navigate">Navigate to Page</option>
                  <option value="custom_js">Run Custom JS</option>
                </select>
              </div>

              {/* Show target dropdown for actions that require a target */}
              {['show', 'hide', 'toggle', 'open_modal', 'close_modal', 'change_text'].includes(newAction) && (
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5 font-bold">TARGET ELEMENT</label>
                  <select 
                    value={newTargetId}
                    onChange={(e) => setNewTargetId(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-[10px]"
                  >
                    <option value="">Select Target...</option>
                    {availableTargets.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show value field for specific interactions */}
              {newAction === 'change_text' && (
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5 font-bold">NEW TEXT CONTENT</label>
                  <input 
                    type="text" 
                    value={newActionVal}
                    onChange={(e) => setNewActionVal(e.target.value)}
                    placeholder="Enter new text..."
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                  />
                </div>
              )}

              {newAction === 'navigate' && (
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5 font-bold">PAGE ROUTE</label>
                  <select 
                    value={newActionVal}
                    onChange={(e) => setNewActionVal(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                  >
                    <option value="">Select page...</option>
                    {project.pages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.path})</option>
                    ))}
                  </select>
                </div>
              )}

              {newAction === 'custom_js' && (
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5 font-bold">JAVASCRIPT BODY</label>
                  <textarea 
                    value={newActionVal}
                    onChange={(e) => setNewActionVal(e.target.value)}
                    placeholder="console.log('Fired!');"
                    required
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-[10px] outline-none focus:border-sky-500"
                  />
                </div>
              )}
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
