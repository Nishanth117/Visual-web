import type { ComponentNode } from '../types';

const domToComponentNode = (el: Element): ComponentNode => {
  const tag = el.tagName.toLowerCase();
  
  // Map tag names to node type categories
  let type = 'container';
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) type = 'heading';
  else if (tag === 'p') type = 'paragraph';
  else if (tag === 'button') type = 'button';
  else if (tag === 'a') type = 'link';
  else if (tag === 'img') type = 'image';
  else if (tag === 'video') type = 'video';
  else if (tag === 'input') type = 'input';
  else if (tag === 'textarea') type = 'textarea';
  else if (tag === 'form') type = 'form';
  else if (tag === 'nav') type = 'navbar';
  else if (tag === 'footer') type = 'footer';
  else if (tag === 'hr') type = 'divider';

  // ID recovery from classList
  let id = `${type}-${Math.random().toString(36).substr(2, 9)}`;
  const classes: string[] = [];

  el.classList.forEach((cls) => {
    if (cls.startsWith('el-')) {
      id = cls; // Keep original editor ID reference
    } else {
      classes.push(cls);
    }
  });

  // Styles parsing from inline style attribute
  const styles: Record<string, string> = {};
  const styleAttr = el.getAttribute('style');
  if (styleAttr) {
    styleAttr.split(';').forEach((rule) => {
      const dividerIdx = rule.indexOf(':');
      if (dividerIdx !== -1) {
        const key = rule.slice(0, dividerIdx).trim();
        const value = rule.slice(dividerIdx + 1).trim();
        if (key && value) {
          styles[key] = value;
        }
      }
    });
  }

  // Attributes parsing
  const attributes: Record<string, string> = {};
  const idAttribute = el.getAttribute('id') || undefined;

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (attr.name !== 'class' && attr.name !== 'style' && attr.name !== 'id') {
      attributes[attr.name] = attr.value;
    }
  }

  // Recursive parsing of children elements
  const children: ComponentNode[] = [];
  let content: string | undefined = undefined;

  if (el.children.length > 0) {
    Array.from(el.children).forEach((child) => {
      children.push(domToComponentNode(child));
    });
  } else {
    // If it's a leaf node, read the text content or raw HTML content
    content = el.innerHTML || undefined;
  }

  return {
    id,
    type,
    tag,
    content,
    styles,
    attributes,
    children,
    classes: classes.length > 0 ? classes : undefined,
    idAttribute,
  };
};

export const parseHtmlToComponentTree = (htmlString: string): ComponentNode => {
  const parser = new DOMParser();
  // Strip head, scripts, body wrapper to extract direct elements
  const doc = parser.parseFromString(htmlString, 'text/html');
  const body = doc.body;

  const firstEl = body.firstElementChild;
  if (!firstEl) {
    throw new Error('Could not find any root element in HTML code');
  }

  return domToComponentNode(firstEl);
};
