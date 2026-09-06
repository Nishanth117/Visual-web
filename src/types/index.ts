export type ViewportType = 'desktop' | 'tablet' | 'mobile';

export interface ComponentNode {
  id: string;
  type: string;
  tag: string;
  content?: string;
  styles: Record<string, string>;
  tabletStyles?: Record<string, string>;
  mobileStyles?: Record<string, string>;
  attributes: Record<string, string>;
  children?: ComponentNode[];
  classes?: string[];
  idAttribute?: string;
  isLocked?: boolean;
  isHidden?: boolean;
  name?: string;
}

export type InteractionEvent = 'click' | 'hover' | 'mouseenter' | 'mouseleave' | 'submit';
export type InteractionAction = 'show' | 'hide' | 'toggle' | 'open_modal' | 'close_modal' | 'change_text' | 'navigate' | 'custom_js';

export interface Interaction {
  id: string;
  triggerElementId: string;
  triggerEvent: InteractionEvent;
  actionType: InteractionAction;
  targetElementId?: string;
  actionValue?: string; // HTML ID, URL, Page ID, class name, text, or custom code
}

export interface Page {
  id: string;
  name: string;
  path: string;
  rootComponent: ComponentNode;
  interactions: Interaction[];
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'icon' | 'font';
  url: string; // Data URL or remote URL
  size: number;
}

export interface ProjectSettings {
  title: string;
  description: string;
  author: string;
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  assets: Asset[];
  settings: ProjectSettings;
}
