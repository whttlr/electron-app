import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CNC Jog Controls',
  tagline: 'Professional CNC machine control with extensible plugin architecture',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://whttlr.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.NODE_ENV === 'development' ? '/' : '/electron-app/',

  // GitHub pages deployment config.
  organizationName: 'whttlr', // Usually your GitHub org/user name.
  projectName: 'electron-app', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/whttlr/electron-app/tree/main/docs-site/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/whttlr/electron-app/tree/main/docs-site/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'CNC Jog Controls',
      logo: {
        alt: 'CNC Jog Controls Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/download', label: 'Download', position: 'left'},
        {to: '/blog', label: 'Updates', position: 'left'},
        {
          href: 'https://whttlr.github.io/plugin-registry/',
          label: 'Plugin Registry',
          position: 'left',
        },
        {
          href: 'https://github.com/whttlr/electron-app',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Download',
              to: '/download',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture/overview',
            },
            {
              label: 'Plugin Development',
              href: 'https://whttlr.github.io/plugin-registry/docs/development/overview',
            },
          ],
        },
        {
          title: 'Features',
          items: [
            {
              label: 'CNC Controls',
              to: '/docs/features/controls',
            },
            {
              label: '3D Visualization',
              to: '/docs/features/visualization',
            },
            {
              label: 'Plugin System',
              href: 'https://whttlr.github.io/plugin-registry/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/whttlr/electron-app',
            },
            {
              label: 'Issues',
              href: 'https://github.com/whttlr/electron-app/issues',
            },
            {
              label: 'Plugin Registry',
              href: 'https://whttlr.github.io/plugin-registry/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CNC Jog Controls. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;