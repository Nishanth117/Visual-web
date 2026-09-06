import JSZip from 'jszip';
import type { Project } from '../types';
import { generateCode } from './codeGenerator';

export const exportProjectToZip = async (project: Project): Promise<Blob> => {
  const zip = new JSZip();
  const { htmlPages, cssCode, jsCode } = generateCode(project);

  // 1. Add Homepage index.html
  if (htmlPages['index']) {
    zip.file('index.html', htmlPages['index']);
  }

  // 2. Add sub-pages inside pages/ directory
  const pagesFolder = zip.folder('pages');
  if (pagesFolder) {
    Object.entries(htmlPages).forEach(([pageId, htmlContent]) => {
      if (pageId === 'index') return;
      pagesFolder.file(`${pageId}.html`, htmlContent);
    });
  }

  // 3. Add CSS folder with style.css
  const cssFolder = zip.folder('css');
  if (cssFolder) {
    cssFolder.file('style.css', cssCode);
  }

  // 4. Add JS folder with script.js
  const jsFolder = zip.folder('js');
  if (jsFolder) {
    jsFolder.file('script.js', jsCode);
  }

  // 5. Add Assets folders
  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    const imgFolder = assetsFolder.folder('images');
    
    project.assets.forEach((asset) => {
      // Decode data url if present
      if (asset.url.startsWith('data:')) {
        const parts = asset.url.split(',');
        const base64Data = parts[1];
        if (base64Data && imgFolder) {
          imgFolder.file(asset.name, base64Data, { base64: true });
        }
      }
    });
  }

  // 6. Add README.md
  const readmeContent = `# ${project.name}

This website was built visually using **VividBuilder**. 

## Project Structure

\`\`\`text
${project.name}/
├── index.html          # Homepage
├── README.md           # Instructions
│
├── pages/              # Extra sub-pages
${project.pages.filter(p => p.id !== 'index').map(p => `│   └── ${p.id}.html`).join('\n')}
│
├── css/
│   └── style.css       # Clean compiled stylesheet with media queries
│
├── js/
│   └── script.js       # Auto-generated event listeners and interactions
│
└── assets/
    └── images/         # Bundled image files
\`\`\`

## Getting Started

You can run this project locally instantly!

1. Open this directory in **Visual Studio Code** or any editor.
2. Open \`index.html\` and click **Go Live** or double-click to run in the browser.
3. Enjoy your clean, semantic, and responsive website.

## Generated with VividBuilder
`;

  zip.file('README.md', readmeContent);

  // Generate ZIP Blob
  return await zip.generateAsync({ type: 'blob' });
};
