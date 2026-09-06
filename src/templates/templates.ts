import type { Project, ComponentNode } from '../types';

// Helper to create IDs
const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

export const createBlankPage = (_name: string, _path: string): ComponentNode => ({
  id: 'root',
  type: 'root',
  tag: 'div',
  name: 'Page Root',
  styles: {
    'min-height': '100vh',
    'background-color': '#0f172a', // Slate 900
    'color': '#f8fafc', // Slate 50
    'font-family': 'Inter, sans-serif',
    'display': 'flex',
    'flex-direction': 'column'
  },
  attributes: {},
  children: [
    {
      id: genId('section'),
      type: 'section',
      tag: 'section',
      name: 'Hero Section',
      styles: {
        'padding-top': '80px',
        'padding-bottom': '80px',
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'text-align': 'center',
        'flex-grow': '1'
      },
      attributes: {},
      children: [
        {
          id: genId('heading'),
          type: 'heading',
          tag: 'h1',
          name: 'Hero Title',
          content: 'Create Something Incredible',
          styles: {
            'font-size': '48px',
            'font-weight': '800',
            'margin-bottom': '16px',
            'background': 'linear-gradient(to right, #38bdf8, #818cf8)',
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
            'line-height': '1.2'
          },
          attributes: {}
        },
        {
          id: genId('paragraph'),
          type: 'paragraph',
          tag: 'p',
          name: 'Hero Subtitle',
          content: 'Drag and drop components to design beautiful pages visually, style them instantly, and export clean, production-ready code.',
          styles: {
            'font-size': '18px',
            'color': '#94a3b8',
            'max-width': '600px',
            'margin-bottom': '32px',
            'line-height': '1.6'
          },
          attributes: {}
        },
        {
          id: genId('button'),
          type: 'button',
          tag: 'button',
          name: 'CTA Button',
          content: 'Get Started',
          styles: {
            'padding': '12px 24px',
            'background-color': '#3b82f6',
            'color': '#ffffff',
            'border-radius': '8px',
            'font-weight': '600',
            'border': 'none',
            'cursor': 'pointer',
            'transition': 'all 0.2s'
          },
          attributes: {}
        }
      ]
    }
  ]
});

export const getPortfolioTemplate = (): Project => {
  const rootId = 'root';
  const navId = genId('navbar');
  const heroId = genId('hero');
  const projectsId = genId('projects');
  const contactId = genId('contact');
  const footerId = genId('footer');

  return {
    id: 'portfolio-template',
    name: 'My Portfolio',
    assets: [],
    settings: {
      title: 'My Developer Portfolio',
      description: 'Sleek professional portfolio created visually.',
      author: 'Developer Pro'
    },
    pages: [
      {
        id: 'index',
        name: 'Home',
        path: 'index.html',
        interactions: [],
        rootComponent: {
          id: rootId,
          type: 'root',
          tag: 'div',
          name: 'Page Root',
          styles: {
            'min-height': '100vh',
            'background-color': '#090d16',
            'color': '#f1f5f9',
            'font-family': 'Inter, sans-serif',
            'display': 'flex',
            'flex-direction': 'column'
          },
          attributes: {},
          children: [
            // Navigation
            {
              id: navId,
              type: 'navbar',
              tag: 'nav',
              name: 'Navigation Bar',
              styles: {
                'display': 'flex',
                'justify-content': 'space-between',
                'align-items': 'center',
                'padding': '20px 40px',
                'border-bottom': '1px solid #1e293b',
                'background-color': '#0d1527'
              },
              attributes: {},
              children: [
                {
                  id: genId('logo'),
                  type: 'text',
                  tag: 'div',
                  name: 'Logo',
                  content: '🚀 DevStudio',
                  styles: { 'font-weight': '800', 'font-size': '20px', 'color': '#38bdf8' },
                  attributes: {}
                },
                {
                  id: genId('navlinks'),
                  type: 'flexbox',
                  tag: 'div',
                  name: 'Nav Links',
                  styles: { 'display': 'flex', 'gap': '24px', 'align-items': 'center' },
                  attributes: {},
                  children: [
                    { id: genId('link'), type: 'link', tag: 'a', name: 'Home Link', content: 'Home', styles: { 'color': '#38bdf8', 'text-decoration': 'none' }, attributes: { 'href': '#home' } },
                    { id: genId('link'), type: 'link', tag: 'a', name: 'Projects Link', content: 'Projects', styles: { 'color': '#94a3b8', 'text-decoration': 'none' }, attributes: { 'href': '#projects' } },
                    { id: genId('link'), type: 'link', tag: 'a', name: 'Contact Link', content: 'Contact', styles: { 'color': '#94a3b8', 'text-decoration': 'none' }, attributes: { 'href': '#contact' } }
                  ]
                }
              ]
            },
            // Hero
            {
              id: heroId,
              type: 'section',
              tag: 'section',
              name: 'Hero Section',
              styles: {
                'padding': '100px 40px',
                'display': 'flex',
                'align-items': 'center',
                'gap': '40px',
                'max-width': '1200px',
                'margin': '0 auto'
              },
              tabletStyles: {
                'flex-direction': 'column',
                'text-align': 'center',
                'padding': '60px 20px'
              },
              attributes: { 'id': 'home' },
              children: [
                {
                  id: genId('hero-content'),
                  type: 'flexbox',
                  tag: 'div',
                  name: 'Hero Text Wrapper',
                  styles: { 'flex': '1', 'display': 'flex', 'flex-direction': 'column', 'align-items': 'flex-start' },
                  tabletStyles: { 'align-items': 'center' },
                  attributes: {},
                  children: [
                    {
                      id: genId('badge'),
                      type: 'text',
                      tag: 'span',
                      name: 'Badge',
                      content: 'AVAILABLE FOR HIRE',
                      styles: {
                        'background-color': '#0f2942',
                        'color': '#38bdf8',
                        'padding': '4px 12px',
                        'border-radius': '9999px',
                        'font-size': '12px',
                        'font-weight': '600',
                        'margin-bottom': '16px'
                      },
                      attributes: {}
                    },
                    {
                      id: genId('title'),
                      type: 'heading',
                      tag: 'h1',
                      name: 'Hero Title',
                      content: 'Building Digital Products, Brands & Experiences.',
                      styles: {
                        'font-size': '54px',
                        'font-weight': '800',
                        'margin-bottom': '20px',
                        'line-height': '1.1'
                      },
                      tabletStyles: {
                        'font-size': '40px'
                      },
                      attributes: {}
                    },
                    {
                      id: genId('desc'),
                      type: 'paragraph',
                      tag: 'p',
                      name: 'Hero Desc',
                      content: 'Hi, I\'m a creative frontend developer focusing on building elegant, responsive web applications with interactive visual experiences.',
                      styles: {
                        'font-size': '18px',
                        'color': '#94a3b8',
                        'margin-bottom': '32px',
                        'line-height': '1.6'
                      },
                      attributes: {}
                    },
                    {
                      id: genId('cta-wrap'),
                      type: 'flexbox',
                      tag: 'div',
                      name: 'CTA Wrapper',
                      styles: { 'display': 'flex', 'gap': '16px' },
                      attributes: {},
                      children: [
                        {
                          id: genId('btn1'),
                          type: 'button',
                          tag: 'button',
                          name: 'Primary Button',
                          content: 'View Projects',
                          styles: {
                            'padding': '14px 28px',
                            'background-color': '#3b82f6',
                            'color': '#ffffff',
                            'border-radius': '8px',
                            'font-weight': '600',
                            'border': 'none',
                            'cursor': 'pointer'
                          },
                          attributes: {}
                        },
                        {
                          id: genId('btn2'),
                          type: 'button',
                          tag: 'button',
                          name: 'Secondary Button',
                          content: 'Let\'s Talk',
                          styles: {
                            'padding': '14px 28px',
                            'background-color': 'transparent',
                            'color': '#ffffff',
                            'border-radius': '8px',
                            'font-weight': '600',
                            'border': '1px solid #334155',
                            'cursor': 'pointer'
                          },
                          attributes: {}
                        }
                      ]
                    }
                  ]
                },
                {
                  id: genId('hero-img-wrap'),
                  type: 'container',
                  tag: 'div',
                  name: 'Hero Image Frame',
                  styles: {
                    'flex': '1',
                    'display': 'flex',
                    'justify-content': 'center'
                  },
                  attributes: {},
                  children: [
                    {
                      id: genId('hero-img'),
                      type: 'image',
                      tag: 'img',
                      name: 'Profile Picture',
                      styles: {
                        'width': '350px',
                        'height': '350px',
                        'border-radius': '24px',
                        'object-fit': 'cover',
                        'border': '4px solid #1e293b',
                        'box-shadow': '0 25px 50px -12px rgba(56, 189, 248, 0.15)'
                      },
                      attributes: {
                        'src': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
                        'alt': 'Profile Avatar'
                      }
                    }
                  ]
                }
              ]
            },
            // Projects Section
            {
              id: projectsId,
              type: 'section',
              tag: 'section',
              name: 'Projects Section',
              styles: {
                'padding': '80px 40px',
                'background-color': '#0d1321',
                'border-top': '1px solid #1e293b'
              },
              attributes: { 'id': 'projects' },
              children: [
                {
                  id: genId('proj-title'),
                  type: 'heading',
                  tag: 'h2',
                  name: 'Projects Section Title',
                  content: 'Featured Works',
                  styles: {
                    'font-size': '36px',
                    'font-weight': '800',
                    'text-align': 'center',
                    'margin-bottom': '12px'
                  },
                  attributes: {}
                },
                {
                  id: genId('proj-subtitle'),
                  type: 'paragraph',
                  tag: 'p',
                  name: 'Projects Section Subtitle',
                  content: 'A selection of digital products built from scratch.',
                  styles: {
                    'text-align': 'center',
                    'color': '#64748b',
                    'margin-bottom': '48px'
                  },
                  attributes: {}
                },
                {
                  id: genId('grid'),
                  type: 'grid',
                  tag: 'div',
                  name: 'Projects Grid',
                  styles: {
                    'display': 'grid',
                    'grid-template-columns': 'repeat(3, 1fr)',
                    'gap': '30px',
                    'max-width': '1200px',
                    'margin': '0 auto'
                  },
                  tabletStyles: {
                    'grid-template-columns': 'repeat(2, 1fr)'
                  },
                  mobileStyles: {
                    'grid-template-columns': '1fr'
                  },
                  attributes: {},
                  children: [
                    // Card 1
                    {
                      id: genId('card1'),
                      type: 'card',
                      tag: 'div',
                      name: 'Project Card 1',
                      styles: {
                        'background-color': '#11192e',
                        'border-radius': '12px',
                        'overflow': 'hidden',
                        'border': '1px solid #1e293b',
                        'display': 'flex',
                        'flex-direction': 'column'
                      },
                      attributes: {},
                      children: [
                        {
                          id: genId('c1-img'),
                          type: 'image',
                          tag: 'img',
                          name: 'Card Image 1',
                          styles: { 'width': '100%', 'height': '200px', 'object-fit': 'cover' },
                          attributes: { 'src': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', 'alt': 'Project One' }
                        },
                        {
                          id: genId('c1-body'),
                          type: 'container',
                          tag: 'div',
                          name: 'Card Content 1',
                          styles: { 'padding': '24px', 'display': 'flex', 'flex-direction': 'column', 'gap': '12px' },
                          attributes: {},
                          children: [
                            { id: genId('c1-h'), type: 'heading', tag: 'h3', name: 'Card Title 1', content: 'Web Dashboard', styles: { 'font-size': '20px', 'font-weight': '700' }, attributes: {} },
                            { id: genId('c1-p'), type: 'paragraph', tag: 'p', name: 'Card Text 1', content: 'An analytics dashboard highlighting interactive chart layouts, dark theme, and grid-responsive cards.', styles: { 'font-size': '14px', 'color': '#94a3b8', 'line-height': '1.5' }, attributes: {} },
                            { id: genId('c1-btn'), type: 'link', tag: 'a', name: 'Card Link 1', content: 'View Live ↗', styles: { 'color': '#38bdf8', 'font-weight': '600', 'text-decoration': 'none', 'margin-top': '10px' }, attributes: { 'href': '#' } }
                          ]
                        }
                      ]
                    },
                    // Card 2
                    {
                      id: genId('card2'),
                      type: 'card',
                      tag: 'div',
                      name: 'Project Card 2',
                      styles: {
                        'background-color': '#11192e',
                        'border-radius': '12px',
                        'overflow': 'hidden',
                        'border': '1px solid #1e293b',
                        'display': 'flex',
                        'flex-direction': 'column'
                      },
                      attributes: {},
                      children: [
                        {
                          id: genId('c2-img'),
                          type: 'image',
                          tag: 'img',
                          name: 'Card Image 2',
                          styles: { 'width': '100%', 'height': '200px', 'object-fit': 'cover' },
                          attributes: { 'src': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80', 'alt': 'Project Two' }
                        },
                        {
                          id: genId('c2-body'),
                          type: 'container',
                          tag: 'div',
                          name: 'Card Content 2',
                          styles: { 'padding': '24px', 'display': 'flex', 'flex-direction': 'column', 'gap': '12px' },
                          attributes: {},
                          children: [
                            { id: genId('c2-h'), type: 'heading', tag: 'h3', name: 'Card Title 2', content: 'Crypto Platform', styles: { 'font-size': '20px', 'font-weight': '700' }, attributes: {} },
                            { id: genId('c2-p'), type: 'paragraph', tag: 'p', name: 'Card Text 2', content: 'A cryptocurrency landing interface including glassmorphism elements, live price feeds, and animations.', styles: { 'font-size': '14px', 'color': '#94a3b8', 'line-height': '1.5' }, attributes: {} },
                            { id: genId('c2-btn'), type: 'link', tag: 'a', name: 'Card Link 2', content: 'View Live ↗', styles: { 'color': '#38bdf8', 'font-weight': '600', 'text-decoration': 'none', 'margin-top': '10px' }, attributes: { 'href': '#' } }
                          ]
                        }
                      ]
                    },
                    // Card 3
                    {
                      id: genId('card3'),
                      type: 'card',
                      tag: 'div',
                      name: 'Project Card 3',
                      styles: {
                        'background-color': '#11192e',
                        'border-radius': '12px',
                        'overflow': 'hidden',
                        'border': '1px solid #1e293b',
                        'display': 'flex',
                        'flex-direction': 'column'
                      },
                      attributes: {},
                      children: [
                        {
                          id: genId('c3-img'),
                          type: 'image',
                          tag: 'img',
                          name: 'Card Image 3',
                          styles: { 'width': '100%', 'height': '200px', 'object-fit': 'cover' },
                          attributes: { 'src': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80', 'alt': 'Project Three' }
                        },
                        {
                          id: genId('c3-body'),
                          type: 'container',
                          tag: 'div',
                          name: 'Card Content 3',
                          styles: { 'padding': '24px', 'display': 'flex', 'flex-direction': 'column', 'gap': '12px' },
                          attributes: {},
                          children: [
                            { id: genId('c3-h'), type: 'heading', tag: 'h3', name: 'Card Title 3', content: 'Developer Workspace', styles: { 'font-size': '20px', 'font-weight': '700' }, attributes: {} },
                            { id: genId('c3-p'), type: 'paragraph', tag: 'p', name: 'Card Text 3', content: 'An integrated online workspace layout built for team collaboration, task boards, and chat modules.', styles: { 'font-size': '14px', 'color': '#94a3b8', 'line-height': '1.5' }, attributes: {} },
                            { id: genId('c3-btn'), type: 'link', tag: 'a', name: 'Card Link 3', content: 'View Live ↗', styles: { 'color': '#38bdf8', 'font-weight': '600', 'text-decoration': 'none', 'margin-top': '10px' }, attributes: { 'href': '#' } }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            // Contact Section
            {
              id: contactId,
              type: 'section',
              tag: 'section',
              name: 'Contact Section',
              styles: {
                'padding': '80px 40px',
                'max-width': '600px',
                'margin': '0 auto'
              },
              attributes: { 'id': 'contact' },
              children: [
                {
                  id: genId('cont-h'),
                  type: 'heading',
                  tag: 'h2',
                  name: 'Contact Header',
                  content: 'Get In Touch',
                  styles: { 'font-size': '36px', 'font-weight': '800', 'text-align': 'center', 'margin-bottom': '16px' },
                  attributes: {}
                },
                {
                  id: genId('cont-p'),
                  type: 'paragraph',
                  tag: 'p',
                  name: 'Contact Sub',
                  content: 'Have an interesting project or looking to hire? Drop me a message and I\'ll get back to you shortly.',
                  styles: { 'color': '#94a3b8', 'text-align': 'center', 'margin-bottom': '32px', 'line-height': '1.5' },
                  attributes: {}
                },
                {
                  id: genId('form'),
                  type: 'form',
                  tag: 'form',
                  name: 'Contact Form',
                  styles: {
                    'display': 'flex',
                    'flex-direction': 'column',
                    'gap': '20px',
                    'background-color': '#0d1321',
                    'padding': '30px',
                    'border-radius': '12px',
                    'border': '1px solid #1e293b'
                  },
                  attributes: { 'action': '#', 'method': 'POST' },
                  children: [
                    {
                      id: genId('input-name'),
                      type: 'input',
                      tag: 'input',
                      name: 'Name Input',
                      styles: { 'padding': '12px', 'background-color': '#11192e', 'border': '1px solid #334155', 'border-radius': '6px', 'color': '#ffffff' },
                      attributes: { 'type': 'text', 'placeholder': 'Your Name', 'required': 'true' }
                    },
                    {
                      id: genId('input-email'),
                      type: 'input',
                      tag: 'input',
                      name: 'Email Input',
                      styles: { 'padding': '12px', 'background-color': '#11192e', 'border': '1px solid #334155', 'border-radius': '6px', 'color': '#ffffff' },
                      attributes: { 'type': 'email', 'placeholder': 'Your Email', 'required': 'true' }
                    },
                    {
                      id: genId('textarea'),
                      type: 'textarea',
                      tag: 'textarea',
                      name: 'Message Textarea',
                      styles: { 'padding': '12px', 'background-color': '#11192e', 'border': '1px solid #334155', 'border-radius': '6px', 'color': '#ffffff', 'height': '100px', 'resize': 'none' },
                      attributes: { 'placeholder': 'How can I help you?', 'required': 'true' }
                    },
                    {
                      id: genId('submit'),
                      type: 'submit',
                      tag: 'button',
                      name: 'Submit Button',
                      content: 'Send Message',
                      styles: { 'padding': '14px', 'background-color': '#3b82f6', 'color': '#ffffff', 'border-radius': '6px', 'font-weight': '600', 'cursor': 'pointer', 'border': 'none' },
                      attributes: { 'type': 'submit' }
                    }
                  ]
                }
              ]
            },
            // Footer
            {
              id: footerId,
              type: 'section',
              tag: 'footer',
              name: 'Footer Section',
              styles: {
                'padding': '40px',
                'border-top': '1px solid #1e293b',
                'text-align': 'center',
                'background-color': '#070a12',
                'color': '#64748b',
                'font-size': '14px'
              },
              attributes: {},
              children: [
                {
                  id: genId('footer-text'),
                  type: 'text',
                  tag: 'p',
                  name: 'Copyright Text',
                  content: '© 2026 Developer Pro. All rights reserved. Created with VividBuilder.',
                  styles: {},
                  attributes: {}
                }
              ]
            }
          ]
        }
      }
    ]
  };
};

export const getBusinessTemplate = (): Project => {
  const rootId = 'root';
  return {
    id: 'business-template',
    name: 'Business Landing',
    assets: [],
    settings: {
      title: 'Apex Business Consulting',
      description: 'Consulting solutions for enterprises.',
      author: 'Apex Inc.'
    },
    pages: [
      {
        id: 'index',
        name: 'Home',
        path: 'index.html',
        interactions: [],
        rootComponent: {
          id: rootId,
          type: 'root',
          tag: 'div',
          name: 'Page Root',
          styles: {
            'min-height': '100vh',
            'background-color': '#ffffff',
            'color': '#0f172a',
            'font-family': 'Inter, sans-serif',
            'display': 'flex',
            'flex-direction': 'column'
          },
          attributes: {},
          children: [
            // Simplified business navigation
            {
              id: genId('navbar'),
              type: 'navbar',
              tag: 'nav',
              name: 'Navigation Bar',
              styles: {
                'display': 'flex',
                'justify-content': 'space-between',
                'align-items': 'center',
                'padding': '20px 40px',
                'border-bottom': '1px solid #e2e8f0',
                'background-color': '#ffffff'
              },
              attributes: {},
              children: [
                {
                  id: genId('logo'),
                  type: 'text',
                  tag: 'div',
                  name: 'Logo',
                  content: '💎 APEX CONSULTING',
                  styles: { 'font-weight': '800', 'font-size': '18px', 'color': '#0f172a' },
                  attributes: {}
                },
                {
                  id: genId('navlinks'),
                  type: 'flexbox',
                  tag: 'div',
                  name: 'Nav Links',
                  styles: { 'display': 'flex', 'gap': '24px' },
                  attributes: {},
                  children: [
                    { id: genId('link'), type: 'link', tag: 'a', name: 'Home Link', content: 'Home', styles: { 'color': '#0f172a', 'text-decoration': 'none', 'font-weight': '500' }, attributes: { 'href': '#' } },
                    { id: genId('link'), type: 'link', tag: 'a', name: 'Services Link', content: 'Services', styles: { 'color': '#64748b', 'text-decoration': 'none', 'font-weight': '500' }, attributes: { 'href': '#services' } }
                  ]
                }
              ]
            },
            // Hero
            {
              id: genId('hero'),
              type: 'section',
              tag: 'section',
              name: 'Hero Section',
              styles: {
                'padding': '120px 40px',
                'display': 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                'text-align': 'center',
                'background': 'radial-gradient(circle, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)'
              },
              attributes: {},
              children: [
                {
                  id: genId('title'),
                  type: 'heading',
                  tag: 'h1',
                  name: 'Hero Title',
                  content: 'Accelerate Your Business Growth',
                  styles: {
                    'font-size': '56px',
                    'font-weight': '900',
                    'color': '#0f172a',
                    'margin-bottom': '24px',
                    'max-width': '800px',
                    'line-height': '1.1'
                  },
                  attributes: {}
                },
                {
                  id: genId('desc'),
                  type: 'paragraph',
                  tag: 'p',
                  name: 'Hero Subtext',
                  content: 'We provide corporate advisory, strategic alignment, and digital engineering services to help modern companies scale globally.',
                  styles: {
                    'font-size': '20px',
                    'color': '#475569',
                    'max-width': '650px',
                    'margin-bottom': '40px',
                    'line-height': '1.6'
                  },
                  attributes: {}
                },
                {
                  id: genId('btn'),
                  type: 'button',
                  tag: 'button',
                  name: 'CTA Button',
                  content: 'Schedule Strategy Call',
                  styles: {
                    'padding': '16px 32px',
                    'background-color': '#0f172a',
                    'color': '#ffffff',
                    'border-radius': '6px',
                    'font-weight': '600',
                    'cursor': 'pointer',
                    'border': 'none'
                  },
                  attributes: {}
                }
              ]
            }
          ]
        }
      }
    ]
  };
};
