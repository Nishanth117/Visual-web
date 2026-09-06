import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { 
  Type, Heading, AlignLeft, Square, Link2, Image, Video, 
  Minimize2, Maximize2, LayoutGrid, Columns, Rows, 
  Menu, CreditCard, Layers, FileInput, CheckSquare, 
  AlertCircle, FormInput, Sliders, Box, HelpCircle as QuestionIcon
} from 'lucide-react';

interface ComponentDef {
  type: string;
  tag: string;
  name: string;
  content?: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
  children?: any[];
}

const basicComponents: ComponentDef[] = [
  {
    type: 'heading',
    tag: 'h2',
    name: 'Heading',
    content: 'Awesome Headline',
    styles: { 'font-size': '28px', 'font-weight': '800', 'margin-bottom': '12px', 'line-height': '1.2' },
    attributes: {},
  },
  {
    type: 'paragraph',
    tag: 'p',
    name: 'Paragraph',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.',
    styles: { 'font-size': '15px', 'color': '#94a3b8', 'line-height': '1.6', 'margin-bottom': '16px' },
    attributes: {},
  },
  {
    type: 'button',
    tag: 'button',
    name: 'Button',
    content: 'Get Started Now',
    styles: { 
      'padding': '10px 20px', 
      'background-color': '#3b82f6', 
      'color': '#ffffff', 
      'border-radius': '6px', 
      'font-weight': '600',
      'border': 'none',
      'cursor': 'pointer',
      'transition': 'all 0.2s'
    },
    attributes: {},
  },
  {
    type: 'link',
    tag: 'a',
    name: 'Text Link',
    content: 'Read documentation →',
    styles: { 'color': '#38bdf8', 'font-weight': '500', 'text-decoration': 'none' },
    attributes: { 'href': '#' },
  },
  {
    type: 'image',
    tag: 'img',
    name: 'Image',
    styles: { 'width': '100%', 'max-width': '400px', 'height': 'auto', 'border-radius': '8px', 'object-fit': 'cover' },
    attributes: { 
      'src': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      'alt': 'Workspace Graphic'
    },
  },
  {
    type: 'video',
    tag: 'video',
    name: 'Video player',
    styles: { 'width': '100%', 'max-width': '500px', 'border-radius': '8px' },
    attributes: { 
      'controls': 'true', 
      'src': 'https://www.w3schools.com/html/mov_bbb.mp4' 
    },
  },
  {
    type: 'divider',
    tag: 'hr',
    name: 'Divider',
    styles: { 'border': 'none', 'border-top': '1px solid #334155', 'margin': '24px 0', 'width': '100%' },
    attributes: {},
  },
  {
    type: 'spacer',
    tag: 'div',
    name: 'Spacer',
    styles: { 'height': '40px', 'width': '100%' },
    attributes: {},
  }
];

const layoutComponents: ComponentDef[] = [
  {
    type: 'container',
    tag: 'div',
    name: 'Container',
    styles: { 'max-width': '1200px', 'margin': '0 auto', 'padding': '24px', 'width': '100%' },
    attributes: {},
    children: []
  },
  {
    type: 'row',
    tag: 'div',
    name: 'Row Layout',
    styles: { 'display': 'flex', 'flex-direction': 'row', 'gap': '16px', 'padding': '16px', 'width': '100%' },
    attributes: {},
    children: []
  },
  {
    type: 'column',
    tag: 'div',
    name: 'Column Layout',
    styles: { 'display': 'flex', 'flex-direction': 'column', 'gap': '16px', 'padding': '16px', 'flex': '1' },
    attributes: {},
    children: []
  },
  {
    type: 'grid',
    tag: 'div',
    name: 'Grid (3 Col)',
    styles: { 
      'display': 'grid', 
      'grid-template-columns': 'repeat(3, 1fr)', 
      'gap': '24px', 
      'padding': '16px',
      'width': '100%'
    },
    attributes: {},
    children: []
  },
  {
    type: 'flexbox',
    tag: 'div',
    name: 'Flex Center',
    styles: { 
      'display': 'flex', 
      'justify-content': 'center', 
      'align-items': 'center', 
      'gap': '12px',
      'padding': '12px',
      'width': '100%'
    },
    attributes: {},
    children: []
  },
  {
    type: 'card',
    tag: 'div',
    name: 'Simple Card',
    styles: { 
      'background-color': '#1e293b', 
      'border-radius': '12px', 
      'padding': '24px', 
      'border': '1px solid #334155',
      'display': 'flex',
      'flex-direction': 'column',
      'gap': '12px'
    },
    attributes: {},
    children: [
      {
        type: 'heading',
        tag: 'h3',
        name: 'Card Title',
        content: 'Product Title',
        styles: { 'font-size': '20px', 'font-weight': '700' },
        attributes: {}
      },
      {
        type: 'paragraph',
        tag: 'p',
        name: 'Card Description',
        content: 'A short description about this awesome product card feature.',
        styles: { 'font-size': '14px', 'color': '#94a3b8' },
        attributes: {}
      }
    ]
  }
];

const navComponents: ComponentDef[] = [
  {
    type: 'navbar',
    tag: 'nav',
    name: 'Navbar Block',
    styles: {
      'display': 'flex',
      'justify-content': 'space-between',
      'align-items': 'center',
      'padding': '16px 24px',
      'background-color': '#0f172a',
      'border-bottom': '1px solid #1e293b',
      'width': '100%'
    },
    attributes: {},
    children: [
      {
        type: 'text',
        tag: 'span',
        name: 'Logo Text',
        content: '🔥 BrandLogo',
        styles: { 'font-weight': '700', 'font-size': '18px' },
        attributes: {}
      },
      {
        type: 'flexbox',
        tag: 'div',
        name: 'Menu Wrapper',
        styles: { 'display': 'flex', 'gap': '16px' },
        attributes: {},
        children: [
          { type: 'link', tag: 'a', name: 'Menu Item', content: 'About', styles: { 'color': '#94a3b8', 'text-decoration': 'none' }, attributes: { 'href': '#' } },
          { type: 'link', tag: 'a', name: 'Menu Item', content: 'Contact', styles: { 'color': '#94a3b8', 'text-decoration': 'none' }, attributes: { 'href': '#' } }
        ]
      }
    ]
  }
];

const formComponents: ComponentDef[] = [
  {
    type: 'form',
    tag: 'form',
    name: 'Empty Form',
    styles: { 
      'display': 'flex', 
      'flex-direction': 'column', 
      'gap': '16px', 
      'padding': '24px', 
      'background-color': '#0d1527',
      'border-radius': '8px',
      'border': '1px solid #1e293b',
      'width': '100%'
    },
    attributes: {},
    children: []
  },
  {
    type: 'input',
    tag: 'input',
    name: 'Text Input',
    styles: { 
      'padding': '10px 14px', 
      'border-radius': '6px', 
      'border': '1px solid #334155', 
      'background-color': '#0f172a',
      'color': '#ffffff',
      'outline': 'none',
      'width': '100%'
    },
    attributes: { 'type': 'text', 'placeholder': 'Enter your full name...' }
  },
  {
    type: 'textarea',
    tag: 'textarea',
    name: 'Textarea',
    styles: { 
      'padding': '10px 14px', 
      'border-radius': '6px', 
      'border': '1px solid #334155', 
      'background-color': '#0f172a',
      'color': '#ffffff',
      'height': '80px',
      'outline': 'none',
      'resize': 'none',
      'width': '100%'
    },
    attributes: { 'placeholder': 'Type your message here...' }
  },
  {
    type: 'submit',
    tag: 'button',
    name: 'Submit Button',
    content: 'Send Form',
    styles: { 
      'padding': '12px', 
      'background-color': '#10b981', // Emerald 500
      'color': '#ffffff', 
      'border-radius': '6px', 
      'font-weight': '600',
      'border': 'none',
      'cursor': 'pointer'
    },
    attributes: { 'type': 'submit' }
  }
];

const advancedComponents: ComponentDef[] = [
  {
    type: 'alert',
    tag: 'div',
    name: 'Success Alert',
    styles: {
      'padding': '16px',
      'background-color': '#064e3b', // Deep green bg
      'border': '1px solid #059669',
      'color': '#a7f3d0',
      'border-radius': '8px',
      'display': 'flex',
      'align-items': 'center',
      'gap': '12px',
      'width': '100%'
    },
    attributes: {},
    children: [
      {
        type: 'text',
        tag: 'span',
        name: 'Alert Text',
        content: 'Success! Your project has been exported successfully.',
        styles: { 'font-size': '14px', 'font-weight': '500' },
        attributes: {}
      }
    ]
  },
  {
    type: 'modal',
    tag: 'div',
    name: 'Modal Container',
    styles: {
      'position': 'fixed',
      'top': '50%',
      'left': '50%',
      'transform': 'translate(-50%, -50%)',
      'width': '400px',
      'background-color': '#1e293b',
      'padding': '30px',
      'border-radius': '12px',
      'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      'border': '1px solid #475569',
      'z-index': '1000',
      'display': 'flex',
      'flex-direction': 'column',
      'gap': '16px'
    },
    attributes: { 'id': 'my-modal' },
    children: [
      { type: 'heading', tag: 'h3', name: 'Modal Title', content: 'Promo Announcement', styles: { 'font-size': '20px', 'font-weight': '700' }, attributes: {} },
      { type: 'paragraph', tag: 'p', name: 'Modal Text', content: 'Sign up to our newsletter to receive visual web builder updates!', styles: { 'font-size': '14px', 'color': '#94a3b8' }, attributes: {} },
      { type: 'button', tag: 'button', name: 'Close Trigger', content: 'Close Modal', styles: { 'padding': '8px 16px', 'background-color': '#ef4444', 'border-radius': '6px', 'font-size': '12px', 'cursor': 'pointer', 'border': 'none', 'align-self': 'flex-end' }, attributes: {} }
    ]
  }
];

export const ComponentToolbox: React.FC = () => {
  const { addComponent, selectedElementId } = useProjectStore();
  const [expandedSection, setExpandedSection] = useState<string>('basic');

  const handleDragStart = (e: React.DragEvent, component: ComponentDef) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddComponent = (component: ComponentDef) => {
    // If an element is selected, add inside it. Otherwise, add to the page root.
    const targetParentId = selectedElementId || 'root';
    addComponent(targetParentId, component);
  };

  const renderCategory = (title: string, id: string, list: ComponentDef[], icon: React.ReactNode) => {
    const isExpanded = expandedSection === id;

    return (
      <div className="border-b border-slate-800">
        <button 
          onClick={() => setExpandedSection(isExpanded ? '' : id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-800/40 text-slate-300 font-semibold text-xs transition outline-none"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="uppercase tracking-wider">{title}</span>
          </div>
          <span className="text-[10px] text-slate-500">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/40 max-h-80 overflow-y-auto">
            {list.map((comp, idx) => (
              <div 
                key={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, comp)}
                onClick={() => handleAddComponent(comp)}
                className="group flex flex-col items-center justify-center p-2.5 bg-slate-900 border border-slate-800 hover:border-sky-500 rounded-lg text-center cursor-pointer hover:bg-slate-850 select-none transition"
                title="Drag onto Canvas or click to append to selection"
              >
                <div className="p-1.5 bg-slate-950 rounded-md text-slate-400 group-hover:text-sky-400 mb-1.5 transition">
                  {getIconForComponent(comp.type)}
                </div>
                <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-200">
                  {comp.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getIconForComponent = (type: string) => {
    const iconSize = "w-4 h-4";
    switch (type) {
      case 'text': return <AlignLeft className={iconSize} />;
      case 'heading': return <Heading className={iconSize} />;
      case 'paragraph': return <AlignLeft className={iconSize} />;
      case 'button': return <Square className={iconSize} />;
      case 'link': return <Link2 className={iconSize} />;
      case 'image': return <Image className={iconSize} />;
      case 'video': return <Video className={iconSize} />;
      case 'divider': return <Minimize2 className={iconSize} />;
      case 'spacer': return <Maximize2 className={iconSize} />;
      case 'container': return <Box className={iconSize} />;
      case 'row': return <Rows className={iconSize} />;
      case 'column': return <Columns className={iconSize} />;
      case 'grid': return <LayoutGrid className={iconSize} />;
      case 'flexbox': return <Box className={iconSize} />;
      case 'card': return <CreditCard className={iconSize} />;
      case 'navbar': return <Menu className={iconSize} />;
      case 'form': return <FormInput className={iconSize} />;
      case 'input': return <FormInput className={iconSize} />;
      case 'textarea': return <FileInput className={iconSize} />;
      case 'submit': return <CheckSquare className={iconSize} />;
      case 'alert': return <AlertCircle className={iconSize} />;
      case 'modal': return <Layers className={iconSize} />;
      default: return <QuestionIcon className={iconSize} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Toolbox Catalog</h2>
        <p className="text-[10px] text-slate-500 mt-1">Drag and drop blocks to canvas or click to insert.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderCategory('Basic', 'basic', basicComponents, <Type className="w-3.5 h-3.5 text-sky-400" />)}
        {renderCategory('Layout', 'layout', layoutComponents, <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />)}
        {renderCategory('Navigation', 'navigation', navComponents, <Menu className="w-3.5 h-3.5 text-indigo-400" />)}
        {renderCategory('Forms', 'forms', formComponents, <Sliders className="w-3.5 h-3.5 text-amber-400" />)}
        {renderCategory('Advanced & Interactions', 'advanced', advancedComponents, <Layers className="w-3.5 h-3.5 text-purple-400" />)}
      </div>
    </div>
  );
};
