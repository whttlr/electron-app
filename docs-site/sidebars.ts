import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/first-run',
        'getting-started/basic-controls',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/controls',
        'features/visualization',
        'features/plugins',
        'features/settings',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/project-structure',
        'architecture/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/setup',
        'development/building',
        'development/testing',
        'development/contributing',
      ],
    },
  ],
};

export default sidebars;