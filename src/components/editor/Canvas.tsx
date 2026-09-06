import React, { useRef, useState, useEffect } from 'react';
import { useProjectStore, findNode } from '../../store/projectStore';
import type { ComponentNode } from '../../types';
import { TextFormatter } from './TextFormatter';
import { 
  Copy, Clipboard, Trash2, Layers, Lock, Layout 
} from 'lucide-react';

export const Canvas: React.FC = () => {
  const {
    project,
    activePageId,
    selectedElementId,
    hoveredElementId,
    viewport,
    isPreviewMode,
    setSelectedElementId,
    setHoveredElementId,
    commit,
    addComponent,
    updateComponent,
    updateComponentStyle,
    deleteComponent,
    duplicateComponent,
    moveComponent,
    copyComponent,
    pasteComponent,
  } = useProjectStore();

  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [resizeBox, setResizeBox] = useState<DOMRect | null>(null);
  
  // Drag and drop drop indicators
  const [dragIndicator, setDragIndicator] = useState<{ parentId: string; index: number; rect: DOMRect } | null>(null);

  const activePage = project.pages.find(p => p.id === activePageId);
  const selectedNode = activePage && selectedElementId
    ? findNode(activePage.rootComponent, selectedElementId)
    : null;

  // Clear context menu on click elsewhere
  useEffect(() => {
    const hideMenu = () => setContextMenu(null);
    window.addEventListener('click', hideMenu);
    return () => window.removeEventListener('click', hideMenu);
  }, []);

  // Keyboard shortcut listener inside canvas area
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPreviewMode || editingTextId) return;

      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.hasAttribute('contenteditable'))) {
        return;
      }

      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            if (selectedElementId) {
              e.preventDefault();
              copyComponent(selectedElementId);
            }
            break;
          case 'v':
            if (selectedElementId) {
              e.preventDefault();
              pasteComponent(selectedElementId);
            } else {
              e.preventDefault();
              pasteComponent('root');
            }
            break;
          case 'd':
            if (selectedElementId && selectedElementId !== 'root') {
              e.preventDefault();
              duplicateComponent(selectedElementId);
            }
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId && selectedElementId !== 'root') {
          e.preventDefault();
          deleteComponent(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyComponent, deleteComponent, duplicateComponent, editingTextId, isPreviewMode, pasteComponent, selectedElementId]);

  useEffect(() => {
    if (!editingTextId) return;

    const editableElement = canvasRef.current?.querySelector<HTMLElement>(
      `[data-node-id="${editingTextId}"]`
    );
    editableElement?.focus();
  }, [editingTextId]);

  useEffect(() => {
    if (isPreviewMode || !selectedElementId || selectedElementId === 'root') {
      setResizeBox(null);
      return;
    }

    const syncResizeBox = () => {
      const selectedElement = canvasRef.current?.querySelector<HTMLElement>(
        `[data-node-id="${selectedElementId}"]`
      );
      setResizeBox(selectedElement?.getBoundingClientRect() ?? null);
    };

    syncResizeBox();
    window.addEventListener('resize', syncResizeBox);
    workspaceRef.current?.addEventListener('scroll', syncResizeBox);

    return () => {
      window.removeEventListener('resize', syncResizeBox);
      workspaceRef.current?.removeEventListener('scroll', syncResizeBox);
    };
  }, [isPreviewMode, project, selectedElementId, viewport]);

  if (!activePage) return null;

  // Compute styles based on current viewport size
  const getMergedStyles = (node: ComponentNode): React.CSSProperties => {
    let combined = { ...node.styles };
    
    if (viewport === 'tablet' || viewport === 'mobile') {
      combined = { ...combined, ...node.tabletStyles };
    }
    if (viewport === 'mobile') {
      combined = { ...combined, ...node.mobileStyles };
    }

    // Convert keys to camelCase for React inline styles
    const result: React.CSSProperties = {};
    Object.entries(combined).forEach(([key, val]) => {
      // Ignore empty style values
      if (!val) return;
      
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) as keyof React.CSSProperties;
      
      // Safety overrides for canvas view
      if (!isPreviewMode && key === 'position' && val === 'fixed') {
        // Prevent elements from floating over editor chrome in editor mode
        result['position'] = 'absolute';
      } else {
        (result as any)[camelKey] = val;
      }
    });

    // In editor mode, give containers some padding if they are empty so they are clickable
    if (!isPreviewMode && (node.children ?? []).length === 0 && ['container', 'section', 'row', 'column', 'grid', 'flexbox', 'form'].includes(node.type)) {
      result.minHeight = '80px';
      result.padding = '20px';
      result.border = '1px dashed rgba(56, 189, 248, 0.4)';
      result.backgroundColor = 'rgba(56, 189, 248, 0.03)';
    }

    // Hidden elements rendering in editor mode
    if (!isPreviewMode && node.isHidden) {
      result.opacity = 0.4;
      result.border = '1px dashed #f43f5e';
    }

    return result;
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedElementId(nodeId);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
    });
  };

  // Drag operations
  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();

    const activePage = project.pages.find(p => p.id === activePageId);
    if (!activePage) return;

    const hoveredNode = findNode(activePage.rootComponent, nodeId);
    if (!hoveredNode || hoveredNode.isLocked) return;

    const targetElement = e.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;

    // Is it a container?
    const isContainer = ['root', 'container', 'section', 'column', 'flexbox', 'row', 'grid', 'form', 'card'].includes(hoveredNode.type);

    let dropIndex = 0;
    let parentId = nodeId;

    if (nodeId === 'root') {
      parentId = 'root';
      dropIndex = (hoveredNode.children ?? []).length;
    } else if (isContainer && relativeY > rect.height * 0.25 && relativeY < rect.height * 0.75) {
      // Drop inside container at the end
      parentId = nodeId;
      dropIndex = (hoveredNode.children ?? []).length;
    } else {
      // Find parent of hoveredNode
      let foundParentId = 'root';
      let siblingIdx = 0;
      
      const findParent = (current: ComponentNode): boolean => {
        const children = current.children ?? [];
        for (let i = 0; i < children.length; i++) {
          if (children[i].id === nodeId) {
            foundParentId = current.id;
            siblingIdx = i;
            return true;
          }
          if (findParent(children[i])) return true;
        }
        return false;
      };
      findParent(activePage.rootComponent);

      parentId = foundParentId;
      // Drop before or after the sibling
      dropIndex = relativeY < rect.height / 2 ? siblingIdx : siblingIdx + 1;
    }

    setDragIndicator({
      parentId,
      index: dropIndex,
      rect,
    });
  };

  const handleDrop = (e: React.DragEvent, nodeId: string) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const componentData = JSON.parse(dataStr);

      if (componentData?.builderAction === 'move-component' && typeof componentData.nodeId === 'string') {
        const targetParentId = dragIndicator?.parentId ?? nodeId;
        moveComponent(componentData.nodeId, targetParentId, dragIndicator?.index);
      } else if (dragIndicator) {
        addComponent(dragIndicator.parentId, componentData, dragIndicator.index);
      } else {
        addComponent(nodeId, componentData);
      }
    } catch (err) {
      console.error('Failed to parse dropped element', err);
    } finally {
      setDragIndicator(null);
    }
  };

  const handleTextBlur = (nodeId: string, e: React.FocusEvent<HTMLElement>) => {
    updateComponent(nodeId, { content: e.currentTarget.innerHTML });
    setEditingTextId(null);
  };

  const parsePx = (value: string | undefined, fallback: number) => {
    if (!value) return fallback;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getCurrentStyleValue = (node: ComponentNode, key: string) => {
    if (viewport === 'mobile') {
      return node.mobileStyles?.[key] ?? node.tabletStyles?.[key] ?? node.styles[key];
    }
    if (viewport === 'tablet') {
      return node.tabletStyles?.[key] ?? node.styles[key];
    }
    return node.styles[key];
  };

  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    direction: 'e' | 's' | 'se'
  ) => {
    if (!selectedNode || !selectedElementId || selectedElementId === 'root') return;

    e.preventDefault();
    e.stopPropagation();

    const selectedElement = canvasRef.current?.querySelector<HTMLElement>(
      `[data-node-id="${selectedElementId}"]`
    );
    if (!selectedElement) return;

    commit();

    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = selectedElement.getBoundingClientRect();
    const startWidth = parsePx(getCurrentStyleValue(selectedNode, 'width'), startRect.width);
    const startHeight = parsePx(getCurrentStyleValue(selectedNode, 'height'), startRect.height);
    const startFontSize = parsePx(getCurrentStyleValue(selectedNode, 'font-size'), 16);
    const scaleText = ['heading', 'paragraph', 'text', 'button', 'link', 'submit'].includes(selectedNode.type);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextWidth = Math.max(24, startWidth + (direction === 's' ? 0 : deltaX));
      const nextHeight = Math.max(12, startHeight + (direction === 'e' ? 0 : deltaY));

      if (direction !== 's') {
        updateComponentStyle(selectedElementId, 'width', `${Math.round(nextWidth)}px`);
      }
      if (direction !== 'e') {
        updateComponentStyle(selectedElementId, 'height', `${Math.round(nextHeight)}px`);
      }

      if (scaleText) {
        const widthScale = direction === 's' ? 1 : nextWidth / Math.max(1, startRect.width);
        const heightScale = direction === 'e' ? 1 : nextHeight / Math.max(1, startRect.height);
        const scale = direction === 'se'
          ? Math.max(widthScale, heightScale)
          : direction === 'e'
            ? widthScale
            : heightScale;
        const nextFontSize = Math.min(96, Math.max(8, startFontSize * scale));
        updateComponentStyle(selectedElementId, 'font-size', `${Math.round(nextFontSize)}px`);
      }

      requestAnimationFrame(() => {
        setResizeBox(selectedElement.getBoundingClientRect());
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setResizeBox(selectedElement.getBoundingClientRect());
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Context Menu Actions
  const handleWrapInContainer = (nodeId: string) => {
    const activePage = project.pages.find(p => p.id === activePageId);
    if (!activePage) return;
    const targetNode = findNode(activePage.rootComponent, nodeId);
    if (!targetNode || nodeId === 'root') return;

    // Wrap logic: delete element, create container containing this element, insert at same place
    // To make it simple: copy, delete, add container, add copied inside container.
    // Let's implement directly:
    const clonedNode = JSON.parse(JSON.stringify(targetNode));
    deleteComponent(nodeId);

    const wrapContainer: Omit<ComponentNode, 'id'> = {
      type: 'container',
      tag: 'div',
      name: 'Wrapped Container',
      styles: { 'padding': '20px', 'width': '100%' },
      attributes: {},
      children: [clonedNode]
    };
    
    // We add it to 'root' or whatever parent was. To keep it simple, we append it to 'root' or parent.
    // Since Zustand store already has addComponent, let's just append to root for safety.
    addComponent('root', wrapContainer);
  };

  // RECURSIVE NODE RENDERER
  const renderCanvasNode = (node: ComponentNode): React.ReactNode => {
    if (node.isHidden && isPreviewMode) return null;

    const isSelected = selectedElementId === node.id;
    const isHovered = hoveredElementId === node.id;
    const isEditingText = editingTextId === node.id;

    // Elements which can hold inline editable text
    const isTextElement = ['heading', 'paragraph', 'text', 'button', 'link'].includes(node.type);

    // Merge styles
    const styles = getMergedStyles(node);

    // Dynamic props
    const elementProps: any = {
      key: node.id,
      style: styles,
      ...node.attributes,
    };

    // Attach custom classes
    let elementClasses = node.classes?.join(' ') || '';

    // Attach editor guides
    if (!isPreviewMode) {
      elementProps['data-node-id'] = node.id;
      elementProps.draggable = node.id !== 'root' && !node.isLocked;
      elementProps.onDragStart = (e: React.DragEvent) => {
        e.stopPropagation();
        setSelectedElementId(node.id);
        e.dataTransfer.setData('application/json', JSON.stringify({
          builderAction: 'move-component',
          nodeId: node.id,
        }));
        e.dataTransfer.effectAllowed = 'move';
      };
      elementProps.onDragEnd = () => {
        setDragIndicator(null);
      };
      
      // Interactive mouse selections
      elementProps.onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (node.isLocked) return;
        setSelectedElementId(node.id);
      };

      elementProps.onMouseEnter = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.isLocked) return;
        setHoveredElementId(node.id);
      };

      elementProps.onMouseLeave = () => {
        setHoveredElementId(null);
      };

      elementProps.onContextMenu = (e: React.MouseEvent) => {
        handleContextMenu(e, node.id);
      };

      // Inline editable text configuration
      if (isTextElement && !node.isLocked) {
        elementProps.onDoubleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          setEditingTextId(node.id);
        };
        
        if (isEditingText) {
          elementProps.contentEditable = true;
          elementProps.suppressContentEditableWarning = true;
          elementProps.onBlur = (e: React.FocusEvent<HTMLElement>) => handleTextBlur(node.id, e);
          
          // Disable clicking selection during editing text
          elementProps.onClick = (e: React.MouseEvent) => e.stopPropagation();
        }
      }

      // Drag and drop events
      elementProps.onDragOver = (e: React.DragEvent) => handleDragOver(e, node.id);
      elementProps.onDrop = (e: React.DragEvent) => handleDrop(e, node.id);

      // Append editor outlining styling
      let outlineClass = '';
      if (isSelected) {
        outlineClass = 'canvas-element-selected';
      } else if (isHovered) {
        outlineClass = 'canvas-element-hovered';
      }
      elementClasses = `${elementClasses} ${outlineClass}`.trim();
    }

    if (elementClasses) {
      elementProps.className = elementClasses;
    }

    // Dynamic HTML ID matching interactions builder
    if (node.idAttribute) {
      elementProps.id = node.idAttribute;
    }

    // Children rendering
    const childrenElements = (node.children ?? []).map((child) => renderCanvasNode(child));

    // Links inside editor mode should not navigate the page
    if (node.tag === 'a' && !isPreviewMode) {
      elementProps.onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedElementId(node.id);
      };
    }

    // Create React element dynamically
    if (isEditingText) {
      elementProps.dangerouslySetInnerHTML = { __html: node.content ?? '' };
      return React.createElement(node.tag, elementProps);
    }

    // Rich text vs children nodes
    if (node.content !== undefined && isTextElement) {
      elementProps.dangerouslySetInnerHTML = { __html: node.content };
      return React.createElement(node.tag, elementProps);
    }

    return React.createElement(node.tag, elementProps, ...childrenElements);
  };

  // Dimensions of canvas device wrapper
  const getCanvasDimensionsClass = (): string => {
    if (viewport === 'tablet') {
      return 'w-[768px] min-h-[1024px] border-x-[12px] border-slate-950 rounded-[24px] my-6 shadow-2xl';
    }
    if (viewport === 'mobile') {
      return 'w-[412px] min-h-[840px] border-[14px] border-slate-950 rounded-[32px] my-6 shadow-2xl';
    }
    return 'w-full min-h-full';
  };

  return (
    <div ref={workspaceRef} className="flex-1 bg-slate-950 overflow-y-auto flex justify-center items-start select-none relative">
      
      {/* Visual Canvas Element Viewport Wrapper */}
      <div 
        ref={canvasRef}
        className={`bg-slate-900 overflow-x-hidden relative transition-all duration-300 ${getCanvasDimensionsClass()}`}
        onClick={() => !isPreviewMode && setSelectedElementId(null)}
        onDragOver={(e) => handleDragOver(e, 'root')}
        onDrop={(e) => handleDrop(e, 'root')}
        style={{
          boxShadow: viewport !== 'desktop' ? '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 'none'
        }}
      >
        
        {/* Dynamic drop indicator visual line */}
        {!isPreviewMode && dragIndicator && (
          <div 
            className="drop-indicator-line"
            style={{
              top: `${dragIndicator.rect.bottom - (canvasRef.current?.getBoundingClientRect().top || 0) + (canvasRef.current?.scrollTop || 0)}px`,
              left: `${dragIndicator.rect.left - (canvasRef.current?.getBoundingClientRect().left || 0)}px`,
              width: `${dragIndicator.rect.width}px`
            }}
          />
        )}

        {/* Root Recursive Render */}
        {renderCanvasNode(activePage.rootComponent)}
      </div>

      {/* Inline Formatting Toolbar for contenteditable ranges */}
      {!isPreviewMode && <TextFormatter canvasRef={canvasRef} />}

      {!isPreviewMode && selectedNode && selectedElementId !== 'root' && resizeBox && workspaceRef.current && (
        <div
          className="visual-resize-box"
          style={{
            top: `${resizeBox.top - workspaceRef.current.getBoundingClientRect().top + workspaceRef.current.scrollTop}px`,
            left: `${resizeBox.left - workspaceRef.current.getBoundingClientRect().left + workspaceRef.current.scrollLeft}px`,
            width: `${resizeBox.width}px`,
            height: `${resizeBox.height}px`,
          }}
        >
          <button
            type="button"
            className="visual-resize-handle visual-resize-handle-e"
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            title="Drag to resize width"
          />
          <button
            type="button"
            className="visual-resize-handle visual-resize-handle-s"
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            title="Drag to resize height"
          />
          <button
            type="button"
            className="visual-resize-handle visual-resize-handle-se"
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            title="Drag to resize and scale text"
          />
        </div>
      )}

      {/* Selected Element floating Tag Label */}
      {!isPreviewMode && selectedElementId && selectedElementId !== 'root' && (
        <div className="absolute top-3 left-4 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow shadow-sky-500/20">
          <Layout className="w-3.5 h-3.5" />
          <span>
            {selectedElementId === 'root' ? 'Page Root' : (activePage.rootComponent.children ?? []).length > 0 
              ? `${findNode(activePage.rootComponent, selectedElementId)?.type.toUpperCase()}`
              : 'Unknown Element'
            }
          </span>
        </div>
      )}

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-slate-950 border border-slate-800 rounded-lg py-1.5 w-48 shadow-2xl z-50 text-slate-300 text-xs select-none"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => { copyComponent(contextMenu.nodeId); setContextMenu(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Component</span>
            <span className="text-[9px] text-slate-500 ml-auto">Ctrl+C</span>
          </button>

          <button 
            onClick={() => { pasteComponent(contextMenu.nodeId); setContextMenu(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-2"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Paste Inside</span>
            <span className="text-[9px] text-slate-500 ml-auto">Ctrl+V</span>
          </button>

          <button 
            onClick={() => { duplicateComponent(contextMenu.nodeId); setContextMenu(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-2"
            disabled={contextMenu.nodeId === 'root'}
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Duplicate</span>
            <span className="text-[9px] text-slate-500 ml-auto">Ctrl+D</span>
          </button>

          <div className="h-px bg-slate-850 my-1" />

          <button 
            onClick={() => { handleWrapInContainer(contextMenu.nodeId); setContextMenu(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-2"
            disabled={contextMenu.nodeId === 'root'}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Wrap In Container</span>
          </button>

          <button 
            onClick={() => { updateComponent(contextMenu.nodeId, { isLocked: !findNode(activePage.rootComponent, contextMenu.nodeId)?.isLocked }); setContextMenu(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>{findNode(activePage.rootComponent, contextMenu.nodeId)?.isLocked ? 'Unlock Element' : 'Lock Element'}</span>
          </button>

          <div className="h-px bg-slate-850 my-1" />

          <button 
            onClick={() => { deleteComponent(contextMenu.nodeId); setContextMenu(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 hover:text-red-400 flex items-center gap-2 font-bold text-red-500"
            disabled={contextMenu.nodeId === 'root'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
            <span className="text-[9px] text-slate-650 ml-auto">Del</span>
          </button>
        </div>
      )}
    </div>
  );
};
