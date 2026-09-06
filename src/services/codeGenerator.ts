import type { Project, Page, ComponentNode } from '../types';

// Helper to convert style objects to CSS text
const stylesToCssString = (styles: Record<string, string>): string => {
  return Object.entries(styles)
    .map(([key, val]) => {
      if (!val) return '';
      return `  ${key}: ${val};`;
    })
    .filter(Boolean)
    .join('\n');
};

// Generate CSS for a node and its children recursively
const generateComponentStyles = (
  node: ComponentNode,
  cssRules: { desktop: string[]; tablet: string[]; mobile: string[] }
) => {
  const className = `el-${node.id}`;

  if (node.styles && Object.keys(node.styles).length > 0) {
    const desktopStyles = stylesToCssString(node.styles);
    if (desktopStyles) {
      cssRules.desktop.push(`.${className} {\n${desktopStyles}\n}`);
    }
  }

  if (node.tabletStyles && Object.keys(node.tabletStyles).length > 0) {
    const tabletStyles = stylesToCssString(node.tabletStyles);
    if (tabletStyles) {
      cssRules.tablet.push(`  .${className} {\n  ${tabletStyles.replace(/\n/g, '\n  ')}\n  }`);
    }
  }

  if (node.mobileStyles && Object.keys(node.mobileStyles).length > 0) {
    const mobileStyles = stylesToCssString(node.mobileStyles);
    if (mobileStyles) {
      cssRules.mobile.push(`  .${className} {\n  ${mobileStyles.replace(/\n/g, '\n  ')}\n  }`);
    }
  }

  (node.children || []).forEach((child) => generateComponentStyles(child, cssRules));
};

// Generate HTML structure for a node and its children recursively
const generateComponentHtml = (node: ComponentNode, depth: number = 0): string => {
  const indent = '  '.repeat(depth);
  const elementClass = `el-${node.id}`;
  
  // Combine custom classes and unique styled class
  let classList = [elementClass];
  if (node.classes && node.classes.length > 0) {
    classList = [...classList, ...node.classes];
  }
  const classStr = classList.length > 0 ? ` class="${classList.join(' ')}"` : '';

  // Element ID attributes
  const idAttrStr = node.idAttribute ? ` id="${node.idAttribute}"` : '';

  // Custom attributes (src, href, placeholder, alt etc)
  const attrsStr = Object.entries(node.attributes || {})
    .map(([key, val]) => ` ${key}="${val}"`)
    .join('');

  const selfClosingTags = ['img', 'br', 'hr', 'input'];
  const isSelfClosing = selfClosingTags.includes(node.tag);

  if (isSelfClosing) {
    return `${indent}<${node.tag}${idAttrStr}${classStr}${attrsStr} />`;
  }

  if (node.content !== undefined && (!node.children || node.children.length === 0)) {
    return `${indent}<${node.tag}${idAttrStr}${classStr}${attrsStr}>${node.content}</${node.tag}>`;
  }

  const childrenHtml = (node.children || [])
    .map((child) => generateComponentHtml(child, depth + 1))
    .join('\n');

  if (node.content !== undefined) {
    return `${indent}<${node.tag}${idAttrStr}${classStr}${attrsStr}>\n${indent}  ${node.content}\n${childrenHtml}\n${indent}</${node.tag}>`;
  }

  return `${indent}<${node.tag}${idAttrStr}${classStr}${attrsStr}>\n${childrenHtml}\n${indent}</${node.tag}>`;
};

// Generate vanilla JavaScript interactions
const generateInteractionsScript = (pages: Page[]): string => {
  let jsCode = `/**\n * Auto-generated interactions by VividBuilder\n */\n\ndocument.addEventListener('DOMContentLoaded', () => {\n`;

  pages.forEach((page) => {
    if (page.interactions.length === 0) return;

    jsCode += `  // Page: ${page.name}\n`;
    
    // Check if index or nested page to run scripts selectively
    const pathName = page.id === 'index' ? 'index.html' : `${page.id}.html`;
    jsCode += `  if (window.location.pathname.endsWith('${pathName}') || (window.location.pathname === '/' && '${page.id}' === 'index')) {\n`;

    page.interactions.forEach((inter) => {
      const triggerSelector = inter.triggerElementId === 'root' 
        ? 'document.body' 
        : `document.querySelector('.el-${inter.triggerElementId}')`;

      const targetSelector = inter.targetElementId 
        ? `document.querySelector('.el-${inter.targetElementId}')` 
        : 'null';

      jsCode += `    // Trigger event for Node ID ${inter.triggerElementId}\n`;
      jsCode += `    const trigger_${inter.id} = ${triggerSelector};\n`;
      jsCode += `    if (trigger_${inter.id}) {\n`;
      jsCode += `      trigger_${inter.id}.addEventListener('${inter.triggerEvent}', (e) => {\n`;

      if (inter.actionType === 'toggle') {
        jsCode += `        const target = ${targetSelector};\n`;
        jsCode += `        if (target) {\n`;
        jsCode += `          const curDisplay = window.getComputedStyle(target).display;\n`;
        jsCode += `          target.style.display = curDisplay === 'none' ? 'block' : 'none';\n`;
        jsCode += `        }\n`;
      } else if (inter.actionType === 'show') {
        jsCode += `        const target = ${targetSelector};\n`;
        jsCode += `        if (target) target.style.display = 'block';\n`;
      } else if (inter.actionType === 'hide') {
        jsCode += `        const target = ${targetSelector};\n`;
        jsCode += `        if (target) target.style.display = 'none';\n`;
      } else if (inter.actionType === 'open_modal') {
        jsCode += `        const target = ${targetSelector};\n`;
        jsCode += `        if (target) {\n`;
        jsCode += `          target.style.display = 'flex';\n`;
        jsCode += `          target.style.position = 'fixed';\n`;
        jsCode += `        }\n`;
      } else if (inter.actionType === 'close_modal') {
        jsCode += `        const target = ${targetSelector};\n`;
        jsCode += `        if (target) target.style.display = 'none';\n`;
      } else if (inter.actionType === 'change_text') {
        jsCode += `        const target = ${targetSelector};\n`;
        jsCode += `        if (target) target.innerHTML = \`${inter.actionValue}\`;\n`;
      } else if (inter.actionType === 'navigate') {
        const dest = inter.actionValue === 'index' ? 'index.html' : `${inter.actionValue}.html`;
        const finalDest = inter.actionValue === 'index' && page.id !== 'index' ? '../index.html' : page.id === 'index' ? `./pages/${dest}` : dest;
        jsCode += `        window.location.href = '${finalDest}';\n`;
      } else if (inter.actionType === 'custom_js') {
        jsCode += `        ${inter.actionValue}\n`;
      }

      jsCode += `      });\n`;
      jsCode += `    }\n`;
    });

    jsCode += `  }\n\n`;
  });

  jsCode += `});\n`;
  return jsCode;
};

// Main Export Interface
export const generateCode = (project: Project): {
  htmlPages: Record<string, string>;
  cssCode: string;
  jsCode: string;
} => {
  const htmlPages: Record<string, string> = {};
  const cssRules = { desktop: [] as string[], tablet: [] as string[], mobile: [] as string[] };

  // Compile Stylesheets
  project.pages.forEach((page) => {
    generateComponentStyles(page.rootComponent, cssRules);
  });

  const fullCss = `/* Standard Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: system-ui, -apple-system, sans-serif;
}

/* ================= CUSTOM PAGE STYLES ================= */
${cssRules.desktop.join('\n\n')}

/* ================= TABLET STYLES ================= */
@media (max-width: 768px) {
${cssRules.tablet.join('\n\n')}
}

/* ================= MOBILE STYLES ================= */
@media (max-width: 480px) {
${cssRules.mobile.join('\n\n')}
}
`;

  // Compile Pages HTML
  project.pages.forEach((page) => {
    const isIndex = page.id === 'index';
    const pathToCss = isIndex ? './css/style.css' : '../css/style.css';
    const pathToJs = isIndex ? './js/script.js' : '../js/script.js';
    
    // Generate inside index element root
    const bodyContent = generateComponentHtml(page.rootComponent, 1);

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.settings.title} | ${page.name}</title>
  <meta name="description" content="${project.settings.description}">
  <meta name="author" content="${project.settings.author}">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="${pathToCss}">
</head>
<body>
${bodyContent}

  <!-- Javascript -->
  <script src="${pathToJs}"></script>
</body>
</html>`;

    htmlPages[page.id] = fullHtml;
  });

  const jsCode = generateInteractionsScript(project.pages);

  return {
    htmlPages,
    cssCode: fullCss,
    jsCode,
  };
};
