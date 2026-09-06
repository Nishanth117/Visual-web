import { create } from 'zustand';
import type { Project, Page, ComponentNode, ViewportType, Asset, Interaction, ProjectSettings } from '../types';
import { getPortfolioTemplate, createBlankPage, getBusinessTemplate } from '../templates/templates';

const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Recursive helper functions
export const findNode = (node: ComponentNode, id: string): ComponentNode | null => {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

export const updateNodeInTree = (
  node: ComponentNode,
  id: string,
  updater: (n: ComponentNode) => Partial<ComponentNode>
): ComponentNode => {
  if (node.id === id) {
    return { ...node, ...updater(node) };
  }
  return {
    ...node,
    children: (node.children || []).map((child) => updateNodeInTree(child, id, updater)),
  };
};

export const deleteNodeFromTree = (
  node: ComponentNode,
  id: string
): { node: ComponentNode; success: boolean } => {
  const index = (node.children || []).findIndex((c) => c.id === id);
  if (index !== -1) {
    const newChildren = [...(node.children || [])];
    newChildren.splice(index, 1);
    return {
      node: { ...node, children: newChildren },
      success: true,
    };
  }

  let success = false;
  const newChildren = (node.children || []).map((child) => {
    if (success) return child;
    const res = deleteNodeFromTree(child, id);
    if (res.success) {
      success = true;
      return res.node;
    }
    return child;
  });

  return {
    node: { ...node, children: newChildren },
    success,
  };
};

export const insertNodeIntoTree = (
  node: ComponentNode,
  parentId: string,
  childToInsert: ComponentNode,
  index?: number
): ComponentNode => {
  if (node.id === parentId) {
    const newChildren = [...(node.children || [])];
    if (index !== undefined) {
      newChildren.splice(index, 0, childToInsert);
    } else {
      newChildren.push(childToInsert);
    }
    return { ...node, children: newChildren };
  }
  return {
    ...node,
    children: (node.children || []).map((child) => insertNodeIntoTree(child, parentId, childToInsert, index)),
  };
};

export const cloneNodeWithNewIds = (node: ComponentNode): ComponentNode => {
  const newId = genId(node.type);
  return {
    ...node,
    id: newId,
    children: (node.children || []).map(cloneNodeWithNewIds),
  };
};

const isDescendantNode = (node: ComponentNode, possibleDescendantId: string): boolean => {
  return (node.children || []).some((child) => {
    if (child.id === possibleDescendantId) return true;
    return isDescendantNode(child, possibleDescendantId);
  });
};

interface ProjectState {
  project: Project;
  activePageId: string; // page name or id (e.g., 'index')
  selectedElementId: string | null;
  hoveredElementId: string | null;
  viewport: ViewportType;
  isPreviewMode: boolean;
  clipboard: ComponentNode | null;
  
  // History
  past: Project[];
  future: Project[];

  // Actions
  loadProject: (project: Project) => void;
  loadTemplate: (templateName: 'blank' | 'portfolio' | 'business') => void;
  setActivePage: (pageId: string) => void;
  setSelectedElementId: (id: string | null) => void;
  setHoveredElementId: (id: string | null) => void;
  setViewport: (viewport: ViewportType) => void;
  setPreviewMode: (isPreview: boolean) => void;
  
  // Undo/Redo
  commit: () => void;
  undo: () => void;
  redo: () => void;

  // Page Actions
  addPage: (name: string) => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, newName: string) => void;
  duplicatePage: (pageId: string) => void;

  // Component Actions
  addComponent: (parentId: string, node: Omit<ComponentNode, 'id'>, index?: number) => void;
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  updateComponentStyle: (id: string, styleKey: string, styleValue: string) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (id: string, parentId: string, index?: number) => void;
  copyComponent: (id: string) => void;
  pasteComponent: (parentId: string) => void;

  // Settings & Assets & Interactions
  updateSettings: (updates: Partial<ProjectSettings>) => void;
  addAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addInteraction: (interaction: Omit<Interaction, 'id'>) => void;
  updateInteraction: (id: string, updates: Partial<Interaction>) => void;
  deleteInteraction: (id: string) => void;
}

const initialProject: Project = getPortfolioTemplate();

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: initialProject,
  activePageId: 'index',
  selectedElementId: null,
  hoveredElementId: null,
  viewport: 'desktop',
  isPreviewMode: false,
  clipboard: null,
  past: [],
  future: [],

  commit: () => {
    set((state) => ({
      past: [...state.past, JSON.parse(JSON.stringify(state.project))],
      future: [],
    }));
  },

  undo: () => {
    const { past, project, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1]!;
    const newPast = past.slice(0, past.length - 1);

    set({
      project: previous,
      past: newPast,
      future: [JSON.parse(JSON.stringify(project)), ...future],
      selectedElementId: null,
    });
  },

  redo: () => {
    const { past, project, future } = get();
    if (future.length === 0) return;

    const next = future[0]!;
    const newFuture = future.slice(1);

    set({
      project: next,
      past: [...past, JSON.parse(JSON.stringify(project))],
      future: newFuture,
      selectedElementId: null,
    });
  },

  loadProject: (project) => {
    set({
      project,
      activePageId: project.pages[0]?.id || 'index',
      selectedElementId: null,
      hoveredElementId: null,
      past: [],
      future: [],
    });
  },

  loadTemplate: (name) => {
    let project = getPortfolioTemplate();
    if (name === 'blank') {
      project = {
        id: 'blank-project',
        name: 'My Website',
        assets: [],
        settings: {
          title: 'My Website',
          description: 'A new website created visually.',
          author: 'Me'
        },
        pages: [
          {
            id: 'index',
            name: 'Home',
            path: 'index.html',
            interactions: [],
            rootComponent: createBlankPage('Home', 'index.html'),
          }
        ]
      };
    } else if (name === 'business') {
      project = getBusinessTemplate();
    }

    get().loadProject(project);
  },

  setActivePage: (pageId) => {
    set({
      activePageId: pageId,
      selectedElementId: null,
      hoveredElementId: null,
    });
  },

  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setHoveredElementId: (id) => set({ hoveredElementId: id }),
  setViewport: (viewport) => set({ viewport }),
  setPreviewMode: (isPreviewMode) => set({ isPreviewMode, selectedElementId: null }),

  addPage: (name) => {
    get().commit();
    const cleanName = name.trim();
    const id = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const path = `pages/${id}.html`;
    const newPage: Page = {
      id,
      name: cleanName,
      path,
      interactions: [],
      rootComponent: createBlankPage(cleanName, path),
    };

    set((state) => ({
      project: {
        ...state.project,
        pages: [...state.project.pages, newPage],
      },
      activePageId: id,
    }));
  },

  deletePage: (pageId) => {
    if (pageId === 'index') return; // Cannot delete index page
    get().commit();

    set((state) => {
      const remainingPages = state.project.pages.filter((p) => p.id !== pageId);
      const newActivePage = state.activePageId === pageId ? 'index' : state.activePageId;
      return {
        project: {
          ...state.project,
          pages: remainingPages,
        },
        activePageId: newActivePage,
        selectedElementId: null,
      };
    });
  },

  renamePage: (pageId, newName) => {
    get().commit();
    set((state) => ({
      project: {
        ...state.project,
        pages: state.project.pages.map((p) => {
          if (p.id !== pageId) return p;
          const cleanName = newName.trim();
          const id = pageId === 'index' ? 'index' : cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const path = pageId === 'index' ? 'index.html' : `pages/${id}.html`;
          return { ...p, name: cleanName, path };
        }),
      },
    }));
  },

  duplicatePage: (pageId) => {
    get().commit();
    const sourcePage = get().project.pages.find((p) => p.id === pageId);
    if (!sourcePage) return;

    const dupName = `${sourcePage.name} Copy`;
    const dupId = `${sourcePage.id}-copy-${Math.random().toString(36).substr(2, 4)}`;
    const dupPath = `pages/${dupId}.html`;

    const duplicatedPage: Page = {
      ...JSON.parse(JSON.stringify(sourcePage)),
      id: dupId,
      name: dupName,
      path: dupPath,
      rootComponent: {
        ...JSON.parse(JSON.stringify(sourcePage.rootComponent)),
        id: 'root', // root component must stay root
      },
    };

    set((state) => ({
      project: {
        ...state.project,
        pages: [...state.project.pages, duplicatedPage],
      },
      activePageId: dupId,
    }));
  },

  addComponent: (parentId, nodeData, index) => {
    get().commit();
    const newNode: ComponentNode = {
      ...nodeData,
      id: genId(nodeData.type),
      children: nodeData.children || [],
    };

    set((state) => {
      const activePage = state.project.pages.find((p) => p.id === state.activePageId);
      if (!activePage) return {};

      const updatedRoot = insertNodeIntoTree(activePage.rootComponent, parentId, newNode, index);
      const updatedPages = state.project.pages.map((p) =>
        p.id === state.activePageId ? { ...p, rootComponent: updatedRoot } : p
      );

      return {
        project: {
          ...state.project,
          pages: updatedPages,
        },
        selectedElementId: newNode.id,
      };
    });
  },

  updateComponent: (id, updates) => {
    get().commit();
    set((state) => {
      const activePage = state.project.pages.find((p) => p.id === state.activePageId);
      if (!activePage) return {};

      const updatedRoot = updateNodeInTree(activePage.rootComponent, id, (node) => {
        const mergedStyles = updates.styles ? { ...node.styles, ...updates.styles } : node.styles;
        const mergedTabletStyles = updates.tabletStyles ? { ...node.tabletStyles, ...updates.tabletStyles } : node.tabletStyles;
        const mergedMobileStyles = updates.mobileStyles ? { ...node.mobileStyles, ...updates.mobileStyles } : node.mobileStyles;
        const mergedAttrs = updates.attributes ? { ...node.attributes, ...updates.attributes } : node.attributes;

        return {
          ...updates,
          styles: mergedStyles,
          tabletStyles: mergedTabletStyles,
          mobileStyles: mergedMobileStyles,
          attributes: mergedAttrs,
        };
      });

      const updatedPages = state.project.pages.map((p) =>
        p.id === state.activePageId ? { ...p, rootComponent: updatedRoot } : p
      );

      return {
        project: {
          ...state.project,
          pages: updatedPages,
        },
      };
    });
  },

  updateComponentStyle: (id, styleKey, styleValue) => {
    // Custom non-committing action for smooth sliders, caller should commit if needed or we commit in specific trigger
    set((state) => {
      const activePage = state.project.pages.find((p) => p.id === state.activePageId);
      if (!activePage) return {};

      const updatedRoot = updateNodeInTree(activePage.rootComponent, id, (node) => {
        const viewport = state.viewport;
        if (viewport === 'tablet') {
          return {
            tabletStyles: {
              ...(node.tabletStyles || {}),
              [styleKey]: styleValue,
            },
          };
        } else if (viewport === 'mobile') {
          return {
            mobileStyles: {
              ...(node.mobileStyles || {}),
              [styleKey]: styleValue,
            },
          };
        } else {
          return {
            styles: {
              ...node.styles,
              [styleKey]: styleValue,
            },
          };
        }
      });

      const updatedPages = state.project.pages.map((p) =>
        p.id === state.activePageId ? { ...p, rootComponent: updatedRoot } : p
      );

      return {
        project: {
          ...state.project,
          pages: updatedPages,
        },
      };
    });
  },

  deleteComponent: (id) => {
    if (id === 'root') return; // Cannot delete root
    get().commit();

    set((state) => {
      const activePage = state.project.pages.find((p) => p.id === state.activePageId);
      if (!activePage) return {};

      const { node: updatedRoot } = deleteNodeFromTree(activePage.rootComponent, id);
      const updatedPages = state.project.pages.map((p) =>
        p.id === state.activePageId ? { ...p, rootComponent: updatedRoot } : p
      );

      // Clean up interactions associated with the deleted node
      const updatedInteractions = activePage.interactions.filter(
        (i) => i.triggerElementId !== id && i.targetElementId !== id
      );

      const finalPages = updatedPages.map((p) =>
        p.id === state.activePageId ? { ...p, interactions: updatedInteractions } : p
      );

      return {
        project: {
          ...state.project,
          pages: finalPages,
        },
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        hoveredElementId: state.hoveredElementId === id ? null : state.hoveredElementId,
      };
    });
  },

  duplicateComponent: (id) => {
    if (id === 'root') return;
    get().commit();

    const activePage = get().project.pages.find((p) => p.id === get().activePageId);
    if (!activePage) return;

    const sourceNode = findNode(activePage.rootComponent, id);
    if (!sourceNode) return;

    // Find parent element
    let parentNode: ComponentNode | null = null;
    const findParent = (current: ComponentNode): boolean => {
      const children = current.children ?? [];
      for (let i = 0; i < children.length; i++) {
        if (children[i].id === id) {
          parentNode = current;
          return true;
        }
        if (findParent(children[i])) return true;
      }
      return false;
    };
    findParent(activePage.rootComponent);

    if (!parentNode) return;

    const duplicatedNode = cloneNodeWithNewIds(sourceNode);
    const siblingIndex = ((parentNode as ComponentNode).children ?? []).findIndex((c) => c.id === id);

    set((state) => {
      const activePage = state.project.pages.find((p) => p.id === state.activePageId);
      if (!activePage) return {};

      const updatedRoot = insertNodeIntoTree(
        activePage.rootComponent,
        (parentNode as ComponentNode).id,
        duplicatedNode,
        siblingIndex + 1
      );

      const updatedPages = state.project.pages.map((p) =>
        p.id === state.activePageId ? { ...p, rootComponent: updatedRoot } : p
      );

      return {
        project: {
          ...state.project,
          pages: updatedPages,
        },
        selectedElementId: duplicatedNode.id,
      };
    });
  },

  moveComponent: (id, parentId, index) => {
    if (id === 'root' || id === parentId) return;

    const activePage = get().project.pages.find((p) => p.id === get().activePageId);
    if (!activePage) return;

    const sourceNode = findNode(activePage.rootComponent, id);
    if (!sourceNode || isDescendantNode(sourceNode, parentId)) return;

    get().commit();
    set((state) => {
      const activePage = state.project.pages.find((p) => p.id === state.activePageId);
      if (!activePage) return {};

      const sourceNode = findNode(activePage.rootComponent, id);
      if (!sourceNode || isDescendantNode(sourceNode, parentId)) return {};

      const { node: rootWithoutSource, success } = deleteNodeFromTree(activePage.rootComponent, id);
      if (!success) return {};

      const updatedRoot = insertNodeIntoTree(rootWithoutSource, parentId, sourceNode, index);
      const updatedPages = state.project.pages.map((p) =>
        p.id === state.activePageId ? { ...p, rootComponent: updatedRoot } : p
      );

      return {
        project: {
          ...state.project,
          pages: updatedPages,
        },
        selectedElementId: id,
        hoveredElementId: null,
      };
    });
  },

  copyComponent: (id) => {
    const activePage = get().project.pages.find((p) => p.id === get().activePageId);
    if (!activePage) return;

    const sourceNode = findNode(activePage.rootComponent, id);
    if (!sourceNode) return;

    set({ clipboard: JSON.parse(JSON.stringify(sourceNode)) });
  },

  pasteComponent: (parentId) => {
    const { clipboard } = get();
    if (!clipboard) return;

    get().commit();
    const nodeToInsert = cloneNodeWithNewIds(clipboard);

    set((state) => {
      const activePage = state.project.pages.find((p) => p.id === state.activePageId);
      if (!activePage) return {};

      const updatedRoot = insertNodeIntoTree(activePage.rootComponent, parentId, nodeToInsert);
      const updatedPages = state.project.pages.map((p) =>
        p.id === state.activePageId ? { ...p, rootComponent: updatedRoot } : p
      );

      return {
        project: {
          ...state.project,
          pages: updatedPages,
        },
        selectedElementId: nodeToInsert.id,
      };
    });
  },

  updateSettings: (updates) => {
    get().commit();
    set((state) => ({
      project: {
        ...state.project,
        name: updates.title ?? state.project.name,
        settings: {
          ...state.project.settings,
          ...updates,
        },
      },
    }));
  },

  addAsset: (asset) => {
    set((state) => ({
      project: {
        ...state.project,
        assets: [...state.project.assets, asset],
      },
    }));
  },

  deleteAsset: (id) => {
    set((state) => ({
      project: {
        ...state.project,
        assets: state.project.assets.filter((a) => a.id !== id),
      },
    }));
  },

  addInteraction: (interactionData) => {
    get().commit();
    const newInteraction: Interaction = {
      ...interactionData,
      id: genId('interaction'),
    };

    set((state) => ({
      project: {
        ...state.project,
        pages: state.project.pages.map((p) =>
          p.id === state.activePageId
            ? { ...p, interactions: [...p.interactions, newInteraction] }
            : p
        ),
      },
    }));
  },

  updateInteraction: (id, updates) => {
    get().commit();
    set((state) => ({
      project: {
        ...state.project,
        pages: state.project.pages.map((p) =>
          p.id === state.activePageId
            ? {
                ...p,
                interactions: p.interactions.map((i) => (i.id === id ? { ...i, ...updates } : i)),
              }
            : p
        ),
      },
    }));
  },

  deleteInteraction: (id) => {
    get().commit();
    set((state) => ({
      project: {
        ...state.project,
        pages: state.project.pages.map((p) =>
          p.id === state.activePageId
            ? { ...p, interactions: p.interactions.filter((i) => i.id !== id) }
            : p
        ),
      },
    }));
  },
}));
